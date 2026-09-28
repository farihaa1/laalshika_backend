import { Router } from "express";
import productRoutes from "../modules/product/product.route";
import userRoutes from "../modules/users/user.routes";
import categoryRoutes from "../modules/category/category.route";

const routes = Router();

routes.use("/users", userRoutes);
routes.use("/products", productRoutes);
routes.use("/categories", categoryRoutes);

export default routes;
