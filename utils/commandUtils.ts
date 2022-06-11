export default {
  getArgs: (text: string) => {
    let argsArray = text.split(/\s*--/);
    let args: Record<string, string> = {};
    argsArray.forEach((arg) => {
      let [key, value] = arg.split(/\s*=\s*/);
      if (key && value) {
        args[key] = value;
      }
    });
    console.log(args);
    return args;
  },
};
