import db from "../db/db.js";

// GET /agentes
export async function obterTodosAgentes() {
  return await db("agentes");
}

// GET /agentes/:id
export async function obterUmAgente(id) {
  return await db("agentes").where({ id }).first();
}

// GET /agentes?cargo=inspetor
export async function obterAgentesDoCargo(cargo) {
  return await db("agentes").whereILike("cargo", cargo);
}

// GET /agentes?sort=dataDeIncorporacao
export async function obterAgentesOrdenadosPorDataIncorpAsc() {
  return await db("agentes").orderBy("dataDeIncorporacao", "asc");
}

// GET /agentes?sort=dataDeIncorporacao
export async function obterAgentesOrdenadosPorDataIncorpDesc() {
  return await db("agentes").orderBy("dataDeIncorporacao", "desc");
}

// POST /agentes
export async function adicionarAgente(dados) {
  const result = await db("agentes").insert(dados, "*");
  return result.length ? result[0] : undefined;
}

// PUT /agentes/:id | PATCH /agentes/:id
export async function atualizarAgente(id, dados) {
  const result = await db("agentes").where({ id }).update(dados, "*");
  return result.length ? result[0] : undefined;
}

// DELETE /agentes/:id
export async function apagarAgente(id) {
  const result = await db("agentes").where({ id }).del("*");
  return result.length ? true : false;
}
