import db from "../db/db.js";

// GET /casos
export async function obterTodosCasos() {
  return await db("casos");
}

// GET /casos/:id
export async function obterUmCaso(id) {
  return await db("casos").where({ id }).first();
}

// POST /casos
export async function adicionarCaso(dados) {
  const result = await db("casos").insert(dados, "*");
  return result.length ? result[0] : undefined;
}

// PUT /casos/:id | PATCH /casos/:id
export async function atualizarCaso(id, dados) {
  const result = await db("casos").where({ id }).update(dados, "*");
  return result.length ? result[0] : undefined;
}

// DELETE /casos/:id
export async function apagarCaso(id) {
  const result = await db("casos").where({ id }).del("*");
  return result.length ? true : false;
}

// GET /casos?agente_id=uuid
export async function obterCasosDeUmAgente(agente_id) {
  return await db("casos").where({ agente_id });
}

// GET /casos?status=aberto
export async function obterCasosStatus(status) {
  return await db("casos").whereILike("status", status);
}

// GET /casos/search?q=homicídio
export async function pesquisarCasos(termo) {
  return await db("casos")
    .whereILike("titulo", `%${termo}%`)
    .orWhereILike("descricao", `%${termo}%`);
}
