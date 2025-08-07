import express from "express";
import agentesRoutes from "./routes/agentesRoutes.js";
import casosRoutes from "./routes/casosRoutes.js";
import { errorHandler, NotFoundRouteError } from "./utils/errorHandler.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/agentes", agentesRoutes);
app.use("/casos", casosRoutes);

app.use((req, res, next) => {
  next(
    new NotFoundRouteError({
      endpoint: `O endpoint '${req.method} ${req.url}' não existe nessa aplicação.`,
    })
  );
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `Servidor do Departamento de Polícia rodando em localhost:${PORT}`
  );
});
