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
		hooks: {
			logMethod: function logMethod(args, method) {
				if (args.length >= 2) {
					args[0] = `${args[0]} %j`
				}
				method.apply(this, args)
			},
		},
	})
})()

export { logger as console, logger }
