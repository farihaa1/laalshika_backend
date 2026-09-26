import { Router } from "express";
import productRoutes from "../modules/product/product.route";
import userRoutes from "../modules/users/user.routes";

const routes = Router();

routes.use("/users", userRoutes);
routes.use("/products", productRoutes);

export default routes;
