import * as agentesRepository from "../repositories/agentesRepository.js";
import { obterCasosDeUmAgente } from "../repositories/casosRepository.js";
import * as Errors from "../utils/errorHandler.js";
import {
  agentePatchSchema,
  agenteSchema,
  idSchema,
  sortSchema,
} from "../utils/schemas.js";
import { z } from "zod";

export async function obterAgentes(req, res, next) {
  if (req.query.cargo || req.query.sort) return next();
  const dados = await agentesRepository.obterTodosAgentes();
  res.status(200).json(dados);
}
// GET /agentes | GET /agentes?cargo | GET /agentes?sort
export async function obterAgentesCargo(req, res, next) {
  if (!req.query.cargo) return next();

  const cargo = req.query.cargo;
  const agentes_encontrados = await agentesRepository.obterAgentesDoCargo(
    cargo
  );
  res.status(200).json(agentes_encontrados);
}

export async function obterAgentesSort(req, res, next) {
  if (!req.query.sort) return next();
  try {
    const sort_parse = sortSchema.safeParse(req.query);

    if (!sort_parse.success)
      throw new Errors.InvalidQueryError(
        z.flattenError(sort_parse.error).fieldErrors
      );

    const sort = sort_parse.data.sort;

    let agentes_encontrados;

    if (sort === 1) {
      agentes_encontrados =
        await agentesRepository.obterAgentesOrdenadosPorDataIncorpAsc();
    }

    if (sort === -1) {
      agentes_encontrados =
        await agentesRepository.obterAgentesOrdenadosPorDataIncorpDesc();
    }

    res.status(200).json(agentes_encontrados);
  } catch (e) {
    next(e);
  }
}

// GET /agentes/:id
export async function obterUmAgente(req, res, next) {
  try {
    const id_parse = idSchema.safeParse(req.params);

    if (!id_parse.success)
      throw new Errors.InvalidIdError(
        z.flattenError(id_parse.error).fieldErrors
      );

    const agente_encontrado = await agentesRepository.obterUmAgente(
      id_parse.data.id
    );

    if (!agente_encontrado)
      throw new Errors.IdNotFoundError({
        id: `O ID '${id_parse.data.id}' não existe nos agentes`,
      });

    res.status(200).json(agente_encontrado);
  } catch (e) {
    next(e);
  }
}

// GET /agentes/:id/casos
export async function obterCasosDoAgente(req, res, next) {
  try {
    const id_parse = idSchema.safeParse(req.params);
    if (!id_parse.success)
      throw new Errors.InvalidIdError(
        z.flattenError(id_parse.error).fieldErrors
      );

    const agente_encontrado = await agentesRepository.obterUmAgente(
      id_parse.data.id
    );

    if (!agente_encontrado)
      throw new Errors.IdNotFoundError({
        id: `O ID '${id_parse.data.id}' não existe nos agentes`,
      });

    const casos_encontrados = await obterCasosDeUmAgente(id_parse.data.id);
    res.status(200).json(casos_encontrados);
  } catch (e) {
    next(e);
  }
}

// POST /agentes
export async function criarAgente(req, res, next) {
  try {
    const body_parse = agenteSchema.safeParse(req.body);

    if (!body_parse.success) {
      const { formErrors, fieldErrors } = z.flattenError(body_parse.error);
      throw new Errors.InvalidFormatError({
        ...(formErrors.length ? { bodyFormat: formErrors } : {}),
        ...fieldErrors,
      });
    }

    const resultado = await agentesRepository.adicionarAgente(body_parse.data);

    res.status(201).json({
      ...resultado,
      dataDeIncorporacao: resultado.dataDeIncorporacao
        .toISOString()
        .split("T")[0],
    });
  } catch (e) {
    next(e);
  }
}

// PUT /agentes/:id | PATCH /agentes/:id
export async function atualizarAgente(req, res, next) {
  try {
    if (req.body.id && req.body.id !== req.params.id)
      throw new Errors.InvalidFormatError({
        id: ["Não é permitido alterar o ID do agente"],
      });
    const id_parse = idSchema.safeParse(req.params);

    if (!id_parse.success)
      throw new Errors.InvalidIdError(
        z.flattenError(id_parse.error).fieldErrors
      );

    const body_parse =
      req.method === "PUT"
        ? agenteSchema.safeParse(req.body)
        : agentePatchSchema.safeParse(req.body);

    if (!body_parse.success) {
      const { formErrors, fieldErrors } = z.flattenError(body_parse.error);
      throw new Errors.InvalidFormatError({
        ...(formErrors.length ? { bodyFormat: formErrors } : {}),
        ...fieldErrors,
      });
    }

    delete body_parse.data.id;

    const agente_atualizado = await agentesRepository.atualizarAgente(
      id_parse.data.id,
      body_parse.data
    );

    if (!agente_atualizado)
      throw new Errors.IdNotFoundError({
        id: `O ID '${id_parse.data.id}' não existe nos agentes`,
      });

    res.status(200).json({
      ...agente_atualizado,
      dataDeIncorporacao: agente_atualizado.dataDeIncorporacao
        .toISOString()
        .split("T")[0],
    });
  } catch (e) {
    next(e);
  }
}

// DELETE /agentes/:id
export async function apagarAgente(req, res, next) {
  try {
    const id_parse = idSchema.safeParse(req.params);

    if (!id_parse.success)
      throw new Errors.InvalidIdError(
        z.flattenError(id_parse.error).fieldErrors
      );

    const agente_apagado = await agentesRepository.apagarAgente(
      id_parse.data.id
    );

    if (!agente_apagado)
      throw new Errors.IdNotFoundError({
        id: `O ID '${id_parse.data.id}' não existe nos agentes`,
      });

    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
}
