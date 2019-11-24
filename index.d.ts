declare module 'graphql2chartjs' {
    import { ChartData } from 'react-chartjs-2';
    import * as chartjs from "chart.js";
    class Graphql2Chartjs {
        constructor(
            graphqlData: any, 
            arg: string | (() => any)
        )
        data: ChartData<chartjs.ChartData>
    }
    
    export = Graphql2Chartjs;
}