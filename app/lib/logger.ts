import { pino } from "pino"

const logger = (() => {
	let transport
	if (process.env.NODE_ENV !== "production") {
		transport = {
			target: "pino-pretty",
			options: {
				colorize: true,
				ignore: "pid,hostname",
				translateTime: "SYS:mediumTime",
				minimumLevel: process.env.NODE_ENV === "test" ? "warn" : "debug",
				levelFirst: true,
			},
		}
	}
	return pino({
		transport,
	})
})()

export { logger as console, logger }
