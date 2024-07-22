import { Context } from "contextlink-mirror";
import { launchPuterShell } from "./puter-shell/main.js";
import { CreateEnvProvider } from "./platform/anura/env.js";
import { CreateFilesystemProvider } from "./platform/anura/filesystem.js";
import { AnuraPTT } from "./pty/AnuraPTT.js";

const providers = [];
const commands = {};
window.process = env.process

const config = window.config || {}

const ptt = new AnuraPTT(process)

await launchPuterShell(
    new Context({
        ptt,
        config,
        providers,
        commands,
        externs: new Context({
            anura,
            process: env,
        }),
        platform: new Context({
            name: "anura",
            env: CreateEnvProvider(anura),
            filesystem: CreateFilesystemProvider(anura),
        }),
    }),
);

const register_provider = (provider) => {
    providers.push(provider);
};

const unregister_provider = (provider) => {
    const idx = providers.indexOf(provider);
    if (idx >= 0) {
            providers.splice(idx, 1);
    }
};

const register_command = (id, command) => {
    commands[id] = command;
};

const unregister_command = (idOrCommand) => {
    if (typeof idOrCommand === "string") {
        delete commands[idOrCommand];
        return;
    }
    for (const id in commands) {
        if (commands[id] === idOrCommand) {
        delete commands[id];
        }
    }
};

export {
    register_provider,
    unregister_provider,
    register_command,
    unregister_command,
};
