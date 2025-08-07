/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex("agentes").del();
  await knex("casos").del();

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

  await knex("casos").insert([
    {
      titulo: "Homicídio no bairro União",
      descricao:
        "Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.",
      status: "aberto",
      agente_id: 1,
    },
    {
      titulo: "Roubo a mão armada",
      descricao:
        "Relato de assalto a uma joalheria no centro da cidade. Câmeras de segurança registraram dois suspeitos encapuzados.",
      status: "solucionado",
      agente_id: 2,
    },
  ]);
}
