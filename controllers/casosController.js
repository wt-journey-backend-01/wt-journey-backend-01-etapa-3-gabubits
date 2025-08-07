import { obterUmAgente } from "../repositories/agentesRepository.js";
import * as casosRepository from "../repositories/casosRepository.js";
import * as Errors from "../utils/errorHandler.js";
import {
  agenteIdSchema,
  casoIdSchema,
  idSchema,
  casoSchema,
  casoPatchSchema,
  statusSchema,
} from "../utils/schemas.js";
import { z } from "zod";

export async function obterCasos(req, res, next) {
  if (req.query.agente_id || req.query.status) return next();
  const dados = await casosRepository.obterTodosCasos();
  res.status(200).json(dados);
}

// GET /casos | GET /casos?agente_id=uuid | GET /casos?status=aberto
export async function obterCasosAgenteId(req, res, next) {
  if (!req.query.agente_id) return next();

  try {
    const agente_id_parse = agenteIdSchema.safeParse(req.query);

    if (!agente_id_parse.success)
      throw new Errors.InvalidIdError(
        z.flattenError(agente_id_parse.error).fieldErrors
      );

    const { agente_id } = agente_id_parse.data;
    const casos_encontrados = await casosRepository.obterCasosDeUmAgente(
      agente_id
    );
    res.status(200).json(casos_encontrados);
  } catch (e) {
    next(e);
  }
}

export async function obterCasosStatus(req, res, next) {
  if (!req.query.status) return next();

  try {
    const status_parse = statusSchema.safeParse(req.query);

    if (!status_parse.success)
      throw new Errors.InvalidFormatError(
        z.flattenError(status_parse.error).fieldErrors
      );

    const status = req.query.status;
    const casos_encontrados = await casosRepository.obterCasosStatus(status);
    res.status(200).json(casos_encontrados);
  } catch (e) {
    next(e);
  }
}

// GET /casos/search?q=homicídio
export function paginaSearch(req, res, next) {
  const q = req.query.q;
  if (q && q.length !== 0) return next();
  return next();
}

export async function pesquisarCasos(req, res, next) {
  const q = req.query.q;
  if (q === undefined) return next();

  const casos_encontrados = await casosRepository.pesquisarCasos(q);
  res.status(200).json(casos_encontrados);
}

// GET /casos/:caso_id/agente
export async function obterAgenteDoCaso(req, res, next) {
  try {
    const caso_id_parse = casoIdSchema.safeParse(req.params);
    if (!caso_id_parse.success)
      throw new Errors.InvalidIdError(
        z.flattenError(caso_id_parse.error).fieldErrors
      );

    const caso_encontrado = await casosRepository.obterUmCaso(
      caso_id_parse.data.id
    );

    if (!caso_encontrado)
      throw new Errors.IdNotFoundError({
        id: `O ID '${caso_id_parse.data.id}' não existe nos casos`,
      });

    const { agente_id } = caso_encontrado;

    const agente_existe = await obterUmAgente(agente_id);

    if (!agente_existe)
      throw new Errors.IdNotFoundError({
        agente_id: `O agente_id '${agente_id}' não existe nos agentes`,
      });

    res.status(200).json(agente_existe);
  } catch (e) {
    next(e);
  }
}

// GET /casos/:id
export async function obterUmCaso(req, res, next) {
  try {
    if (req.params.id.includes("search")) {
      return next();
    }

    const id_parse = idSchema.safeParse(req.params);

    if (!id_parse.success)
      throw new Errors.InvalidIdError(
        z.flattenError(id_parse.error).fieldErrors
      );

    const caso_encontrado = await casosRepository.obterUmCaso(id_parse.data.id);

    if (!caso_encontrado)
      throw new Errors.IdNotFoundError({
        id: `O ID '${id_parse.data.id}' não existe nos casos`,
      });

    res.status(200).json(caso_encontrado);
  } catch (e) {
    next(e);
  }
}

// POST /casos
export async function criarCaso(req, res, next) {
  try {
    const body_parse = casoSchema.safeParse(req.body);

    if (!body_parse.success) {
      const { formErrors, fieldErrors } = z.flattenError(body_parse.error);
      if (fieldErrors.agente_id)
        throw new Errors.InvalidIdError({ agente_id: fieldErrors.agente_id });
      throw new Errors.InvalidFormatError({
        ...(formErrors.length ? { bodyFormat: formErrors } : {}),
        ...fieldErrors,
      });
    }

    delete body_parse.data.id;

    const agente_existe = await obterUmAgente(body_parse.data.agente_id);

    if (!agente_existe)
      throw new Errors.IdNotFoundError({
        agente_id: `O agente_id '${body_parse.data.agente_id}' não existe nos agentes`,
      });

    const resultado = await casosRepository.adicionarCaso(body_parse.data);
    res.status(201).json(resultado);
  } catch (e) {
    next(e);
  }
}

// PUT /casos/:id | PATCH /casos/:id
export async function atualizarCaso(req, res, next) {
  try {
    if (req.body.id && req.body.id !== req.params.id)
      throw new Errors.InvalidFormatError({
        id: ["Não é permitido alterar o ID do caso"],
      });

    const id_parse = idSchema.safeParse(req.params);

    if (!id_parse.success)
      throw new Errors.InvalidIdError(
        z.flattenError(id_parse.error).fieldErrors
      );

    const body_parse =
      req.method === "PUT"
        ? casoSchema.safeParse(req.body)
        : casoPatchSchema.safeParse(req.body);

    if (!body_parse.success) {
      const { formErrors, fieldErrors } = z.flattenError(body_parse.error);
      if (fieldErrors.agente_id)
        throw new Errors.InvalidIdError({ agente_id: fieldErrors.agente_id });
      throw new Errors.InvalidFormatError({
        ...(formErrors.length ? { bodyFormat: formErrors } : {}),
        ...fieldErrors,
      });
    }

    if (body_parse.data.agente_id) {
      const agente_existe = await obterUmAgente(body_parse.data.agente_id);

      if (!agente_existe)
        throw new Errors.IdNotFoundError({
          agente_id: `O agente_id '${body_parse.data.agente_id}' não existe nos agentes`,
        });
    }

    const caso_atualizado = await casosRepository.atualizarCaso(
      id_parse.data.id,
      body_parse.data
    );

    if (!caso_atualizado)
      throw new Errors.IdNotFoundError({
        id: `O ID '${id_parse.data.id}' não existe nos casos`,
      });

    res.status(200).json(caso_atualizado);
  } catch (e) {
    next(e);
  }
}

// DELETE /casos/:id
export async function apagarCaso(req, res, next) {
  try {
    const id_parse = idSchema.safeParse(req.params);

    if (!id_parse.success)
      throw new Errors.InvalidIdError(
        z.flattenError(id_parse.error).fieldErrors
      );

    const caso_apagado = await casosRepository.apagarCaso(id_parse.data.id);

    if (!caso_apagado)
      throw new Errors.IdNotFoundError({
        id: `O ID '${id_parse.data.id}' não existe nos casos`,
      });

    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
}
