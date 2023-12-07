import React, { Component } from "react";
import { Table, TableData } from "@finos/perspective";
import { ServerRespond } from "./DataStreamer";
import { DataManipulator } from "./DataManipulator";
import "./Graph.css";

interface IProps {
  data: ServerRespond[];
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void;
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement("perspective-viewer");
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = (document.getElementsByTagName(
      "perspective-viewer"
    )[0] as unknown) as PerspectiveViewerElement;
    //adjusting schema allow traders to get better insight on each trade/buy
    const schema = {
      /* provides insight into the performance of 
      this particular stock, helping traders make 
      informed decisions based on its market value.
      */
      price_abc: "float",
      price_def: "float",
      ratio: "float", //Changes in this ratio may signal trading opportunities.
      timestamp: "date",
      upper_bound: "float", // This can be useful for risk management and setting targets.
      lower_bound: "float", //helps pay attention to a dip in a trade
      trigger_alert: "float", //serves as an alert mechanism i used this to get out of a trade at goal point and to avoid losses
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      /*
      Aggregation Settings:
       Adjusted the aggregates settings to use avg for various fields.
        This is appropriate for numerical data like prices and ratios. 
      */
      elem.load(this.table);
      elem.setAttribute("view", "y_line");
      elem.setAttribute("row-pivots", '["timestamp"]');
      elem.setAttribute(
        "columns",
        '["ratio", "lower_bound", "upper_bound", "trigger_alert"]'
      );
      elem.setAttribute(
        "aggregates",
        JSON.stringify({
          price_abc: "avg",
          price_def: "avg",
          ratio: "avg",
          timestamp: "distinct count",
          upper_bound: "avg",
          lower_bound: "avg",
          trigger_alert: "avg",
        })
      );
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update(([
        DataManipulator.generateRow(this.props.data),
      ] as unknown) as TableData);
    }
  }
}

export default Graph;
