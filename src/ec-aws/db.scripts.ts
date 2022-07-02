import handler from "./cli.custom.cmd";
import yargs from "yargs";

const handle = async (commands: any[] = []) => {
  for await (let cmd of commands) {
    await handler(cmd, {}, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
        return;
      }

      if (stderr) {
        console.error(stderr);
        return;
      }

      console.log(stdout);
    });
  }
};

yargs
  .usage("Usage: $0 <cmd> [options]")
  .command("s:cli", "Sequelize command", async (options) => {
    const commands = options.argv["_"].slice(1); // to trim the command name(ie. s:cli)

    handle(commands)
      .then(() => {
        process.exit(0);
      })
      .catch((error) => {
        process.exit(1);
      });
  })
  .parse();
