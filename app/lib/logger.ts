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
				minimumLevel: "debug",
				levelFirst: true,
			},
		}
	}
	return pino({
		enabled: process.env.NODE_ENV !== "test",
		transport,
	})
})()

export { logger as console, logger }
