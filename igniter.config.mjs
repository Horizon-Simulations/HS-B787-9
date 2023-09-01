import { ExecTask, TaskOfTasks } from "@flybywiresim/igniter";
export default new TaskOfTasks("Horizon Sim 787-9", [
    // A32NX Task
    new TaskOfTasks("All", [
        new TaskOfTasks("Preparation",[
            new ExecTask("Enviroment Setup", "npm run prep-HS789:setup"),
            new ExecTask("Install Dependencies", "npm ci"),            
            new ExecTask("Copy files", "npm run prep-HS789:copy-base-package"),
        ], false),
        new TaskOfTasks("Build", [            
            new ExecTask("Build","npm run build-HS789:build")
        ],true),
        new TaskOfTasks("Dist",[
            new ExecTask("Layout Update", "npm run final-HS789:layout")
        ])
    ], false),    
]);