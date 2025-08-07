/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex("agentes").del();

  await knex("agentes").insert([
    {
      nome: "Rommel Carneiro",
      dataDeIncorporacao: "1992-10-04",
      cargo: "delegado",
    },
    {
      nome: "Luciana Farias",
      dataDeIncorporacao: "2005-06-17",
      cargo: "inspetor",
    },
  ]);
}
