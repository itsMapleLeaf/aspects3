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
		transport,
		enabled: process.env.NODE_ENV !== "test",
	})
})()

export { logger as console, logger }
