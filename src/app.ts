import express, { Application, NextFunction, Request, Response } from "express"
import routes from "./routes";

const app: Application = express();


app.use(express.json());
app.use('/api',routes)


app.get('/', (req: Request, res: Response) => {
    res.send("App is running")
})

// Global Error Handler
app.use((
    error: any,
    req: Request,
    res: Response,
    nest: NextFunction
) => {
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Something went wrong globally",
        error
    })
}

)


export default app;