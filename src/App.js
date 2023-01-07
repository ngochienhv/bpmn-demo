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
import { Accordion, AccordionBody, AccordionHeader, AccordionItem } from "react-headless-accordion";
import { baseXml } from "./utils/baseXml";
import "./index.css";

const Card = ({ data }) => {
  return (
    <AccordionItem>
      {data.map(item => (
        <>
          <AccordionHeader>
            <p className={`accordion-title`}>{item.text}</p>
          </AccordionHeader>
          <AccordionBody>
            <div className="accordion-body">
              {item.blocks?.length && <Card data={item.blocks} />}
            </div>
          </AccordionBody>
        </>
      ))}
    </AccordionItem>
  )
}

function App() {
  const downloadLinkRef = useRef(null);
  const uploadLinkRef = useRef(null);
  const [modeler, setModeler] = useState();
  const [result, setResult] = useState();
  const [logType, setLogType] = useState('time');
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
      } else if (businessObject.$type.includes("Gateway")) {
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

  const copyToClipboard = async () => {
    const graphString = JSON.stringify(getElementForGraph());
    const res = await fetch('http://localhost:8080/api/evaluate/time', { method: 'post', body: graphString });
    res.json().then((data) => {
      console.log(data);
      setResult(data);
    }).catch((err) => {
      console.log(err);
    })
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
        // guidelineValidator
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
    <div className="container">
      <div>
        <input
          type="file"
          onChange={handleUploadFile}
          ref={uploadLinkRef}
          style={{ display: 'none' }}
        />
        <div style={{ backgroundColor: '#228BE6', display: 'flex', flexDirection: 'row', padding: 22.5 }}>
          <a href="#" className="header-link" style={{ textDecoration: 'underline' }}>BPE</a>
          <a onClick={saveBpmn} href="#" ref={downloadLinkRef} className="header-link">
            Export file
          </a>
          <a href="#" onClick={() => uploadLinkRef.current.click()} className="header-link">Import File</a>
          <a href="#" onClick={copyToClipboard} className="header-link">Evaluate</a>
        </div>
        <div id="canvas" />
        {result ?
          <div style={{ height: 220, backgroundColor: 'white', position: 'absolute', left: '0', bottom: '0', right: '20%', borderTop: '1px solid black', display: 'flex' }}>
            <div style={{ width: '49%', padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '33% 33% 34%', borderBottom: '1px solid #D8D8D8' }}>
                <h3 >Number</h3>
                <h3>Criteria</h3>
                <h3>Value</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '33% 33% 34%', borderBottom: '1px solid #D8D8D8', cursor: 'pointer' }} onClick={() => setLogType('time')}>
                <h3 style={{ fontWeight: 500 }}>1</h3>
                <h3 style={{ fontWeight: 500 }}>Total cycle time</h3>
                <h3 style={{ fontWeight: 500 }}>{result?.currentCycleTime}</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '33% 33% 34%', borderBottom: '1px solid #D8D8D8', cursor: 'pointer' }} onClick={() => setLogType('quality')}>
                <h3 style={{ fontWeight: 500 }}>2</h3>
                <h3 style={{ fontWeight: 500 }}>Quality</h3>
                <h3 style={{ fontWeight: 500 }}>{result?.quality}</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '33% 33% 34%', borderBottom: '1px solid #D8D8D8', cursor: 'pointer' }} onClick={() => setLogType('flexibility')}>
                <h3 style={{ fontWeight: 500 }}>3</h3>
                <h3 style={{ fontWeight: 500 }}>Flexibility</h3>
                <h3 style={{ fontWeight: 500 }}>{result?.flexibility}</h3>
              </div>
            </div>
            <div style={{ width: '2%', borderLeft: '1px solid black' }} />
            <div style={{ width: '49%', padding: 20 }}>
              {(() => {
                switch (logType) {
                  default:
                  case 'time':
                    return (<>
                      <h3>Total cycle time Log</h3>
                      <Accordion>
                        <Card data={result?.logsCycleTime} />
                      </Accordion>
                    </>)
                  case 'quality':
                    return (<>
                      <h3>Quality Log</h3>
                      <h3>Total loops' cycle time: <span style={{ fontWeight: 500 }}>{result?.totalCycleTimeAllLoops}</span></h3>
                      {result?.logsQuality.map((log) => <Accordion>
                        <AccordionHeader>
                          <p>{log.text}</p>
                        </AccordionHeader>
                        <AccordionBody>
                          <p><span style={{ fontWeight: 600 }}>Start Gateway: </span>{log.start}</p>
                          <p><span style={{ fontWeight: 600 }}>End Gateway: </span>{log.end}</p>
                          <p><span style={{ fontWeight: 600 }}>Repetition Work: </span>{log.reworkProbability}</p>
                          <p><span style={{ fontWeight: 600 }}>Cycle Time: </span>{log.cycleTime}</p>
                        </AccordionBody>
                      </Accordion>)}
                    </>)
                  case 'flexibility':
                    return (<>
                      <h3>Flexibility Log</h3>
                      <h3>Number of total tasks: <span style={{ fontWeight: 500 }}>{result?.numberOfTotalTasks}</span></h3>
                      <h3>Number of optional tasks: <span style={{ fontWeight: 500 }}>{result?.numberOfOptionalTasks}</span></h3>
                    </>)
                }
              }
              )()}
            </div>
          </div> : null}
      </div>
      <div id="properties" className="properties" />
    </div>
  );
}

export default App;
