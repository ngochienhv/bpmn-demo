import BpmnModeler from "bpmn-js/lib/Modeler";
import guidelineValidator from "bpmn-js-guideline-validator";
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import MagicPropertiesProviderModule from './provider/magic';
import magicModdleDescriptor from './descriptors/magic';

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

import "bpmn-js-guideline-validator/dist/css/guideline-validation.css";
import "bpmn-js-guideline-validator/dist/css/app.css";

import "bpmn-js-properties-panel/dist/assets/element-templates.css";
import "bpmn-js-properties-panel/dist/assets/properties-panel.css";

import { useEffect, useRef, useState } from "react";
import { baseXml } from "./utils/baseXml";
import "./index.css";

function App() {
  const downloadLinkRef = useRef(null);
  const [modeler, setModeler] = useState();
  const [elementRegistry, setElementRegistry] = useState();
  const [file, setFile] = useState();

  const handleUploadFile = (e) => {
    setFile(e.target.files[0]);
  };

  const renderDiagram = () => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = async e => {
      let xml = e.target.result;
      try {
        await modeler.importXML(xml);
        const canvas = modeler.get("canvas");
        canvas.zoom("fit-viewport", "auto");
      } catch (err) {
        console.log(err);
      }
    }
  }

  const setEncoded = (link, name, data) => {
    const encodedData = encodeURIComponent(data.xml);
    if (data) {
      link.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData);
      link.setAttribute('download', name);
    }
  }

  const saveBpmn = () => {
    modeler.saveXML({ format: true }).then((xml, err) => {
      setEncoded(downloadLinkRef.current, 'diagram.bpmn', err ? null : xml);
    }
    );
  }

  const getElements = () => {
    const elements = elementRegistry.getAll();
    const res = elements.map((element) => element.businessObject);
    const result = {
      tasks: [],
      gateways: [],
      flows: []
    };
    res.map((element) => {
      switch (element.$type) {
        case "bpmn:Participant":
          result.name = element.name;
          break;
        case "bpmn:StartEvent":
          result.tasks.push({ id: element.id, label: "start" });
          break;
        case "bpmn:EndEvent":
          result.tasks.push({ id: element.id, label: "end" });
          break;
        case "bpmn:Task":
          result.tasks.push({ id: element.id, label: element.name });
          break;
        case "bpmn:ExclusiveGateway":
          result.gateways.push({ id: element.id, type: "XOR", label: null });
          break;
        case "bpmn:ParallelGateway":
          result.gateways.push({ id: element.id, type: "AND", label: null });
          break;
        case "bpmn:InclusiveGateway":
          result.gateways.push({ id: element.id, type: "OR", label: null });
          break;
        case "bpmn:SequenceFlow":
          result.flows.push({ src: element.sourceRef.id, tgt: element.targetRef.id, label: null });
          break;
        default:
          break;
      }
      return false;
    })
    return result;
  };

  const getElementForGraph = () => {
    const elements = elementRegistry.getAll();
    const obj = {};
    elements.map((element) => {
      const businessObject = element.businessObject;
      const incoming = businessObject.incoming ? businessObject.incoming.map((obj) => obj.sourceRef.id) : [];
      const outgoing = businessObject.outgoing ? businessObject.outgoing.map((obj) => obj.targetRef.id) : [];
      let type;
      let name;
      let cycletime;
      let branchingProbabilities = [];
      if (businessObject.$type.includes("Task")) {
        type = "task";
        cycletime = parseInt(businessObject.cycleTime);
      } else if (businessObject.$type.includes("Event")) {
        type = "event";
        name = businessObject.$type.split(":")[1];
      } else if (businessObject.$type.includes("ExclusiveGateway") || businessObject.$type.includes("InclusiveGateway")) {
        type = "gateway"
        name = businessObject.$type.split(":")[1];
        businessObject.outgoing.map((flow) => branchingProbabilities.push(parseFloat(flow.branchingProbability)))
      }
      if (type) {
        const id = businessObject.id.toString();
        obj[id] = {
          id: businessObject.id,
          name: businessObject.name || name,
          incoming: incoming,
          outgoing: outgoing,
          type: type,
          cycleTime: cycletime || 0,
          branchingProbabilities: branchingProbabilities || []
        };
      }

      return false;
    });
    return obj;
  };

  const copyToClipboard = () => {
    const graphString = JSON.stringify(getElementForGraph());
    navigator.clipboard.writeText(graphString);
    console.log(graphString);
    alert('Clipboard copied');
  };

  useEffect(() => {
    const modeler = new BpmnModeler({
      container: "#canvas",
      propertiesPanel: {
        parent: '#properties'
      },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        MagicPropertiesProviderModule,
        guidelineValidator
      ],
      moddleExtensions: {
        magic: magicModdleDescriptor
      },
      keyboard: {
        bindTo: document,
      },
    });
    setElementRegistry(() => modeler.get('elementRegistry'));
    async function defailtModel() {
      setModeler(modeler);
      try {
        await modeler.importXML(baseXml);
        const canvas = modeler.get("canvas");
        canvas.zoom("fit-viewport", "auto");
      } catch (err) {
        console.log(err);
      }
    }

    defailtModel();
  }, []);

  useEffect(() => {
    file && renderDiagram();
  }, [file]);


  return (
    <div>
      <div style={{ position: 'absolute', top: 10 }}>
        <input
          type="file"
          onChange={handleUploadFile}
        />
        <a onClick={saveBpmn} href="/" ref={downloadLinkRef}>Export</a>
        <button onClick={() => console.log(JSON.stringify(getElements()))} style={{ marginLeft: 50, width: "auto" }}>Get JSON for restructure</button>
        <button onClick={copyToClipboard} style={{ marginLeft: 50, width: "auto" }}>Get JSON for graph</button>
      </div>
      <div className="container">
        <div id="canvas" style={{ width: "100%", height: "100vh", marginTop: 40 }} />
        <div id="properties" className="properties" />
      </div>
    </div>
  );
}

export default App;
