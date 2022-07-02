import { register, registerDev, handler } from "./cli.db.service";

/**
 * Register command for all stages
 * @type {string}
 */
register["cmd:sample1"] = (args, callback, context) => {
  console.log("Running sample 1 command for all stages");
};

/**
 * Register commands for development only
 * @type {string}
 */
registerDev["cmd:sample2"] = (args, callback, context) => {
  console.log("Running sample 2 on dev stages");
};

export default handler;
