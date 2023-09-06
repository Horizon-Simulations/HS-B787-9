import { ExecTask, TaskOfTasks } from "@flybywiresim/igniter";
export default new TaskOfTasks("all", [
    new TaskOfTasks("HS789", [
        // Prepare the out folder and any other pre tasks.
        // Currently, these can be run in parallel but in the future, we may need to run them in sequence if there are any dependencies.
        new TaskOfTasks("build", [            
            new ExecTask("model","npm run build-hs789:model")
        ],false),
        
        new TaskOfTasks("copy", [            
            new ExecTask("model","npm run build-hs789:copy-model")
        ],false),
        // Create final package meta files.
        new TaskOfTasks(
            "dist",
            [
                new ExecTask("metadata", "npm run build-hs789:metadata"),
                new ExecTask("manifests", "npm run build-hs789:manifest"),
            ],
            true
        ), 
    ]),
]);