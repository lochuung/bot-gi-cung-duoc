import { CommandStorage } from "@app/command/common/command.storage";

export function Command(commandName: string) {
    return function (target: any) {
        CommandStorage.registerCommand(commandName, target);
    };
}