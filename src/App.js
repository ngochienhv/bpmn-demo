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
import { AppShell, Box, Divider, Accordion as MantineAccordion, Table, SimpleGrid, Text, Paper, Space, Grid, Aside, ScrollArea } from "@mantine/core";
import { NavbarMinimalColored } from "./Navbar";
import { IconArrowForward } from "@tabler/icons";

import './index.css';

const Card = ({ data, level }) => {
  level = level + 1;
  return (
    data.map((item, index) => (
      <Paper>
        <Text size="md">{item.text}</Text>
        <Grid columns={30}>
          <Grid.Col span={level}>{item.blocks?.length > 0 ? <IconArrowForward /> : null}</Grid.Col>
          <Grid.Col span={30 - level}>
            {item.blocks?.length > 0 && <Card data={item.blocks} level={level} />}
          </Grid.Col>
        </Grid>
      </Paper>
    ))
  )
}

function App() {
  const downloadLinkRef = useRef(null);
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

  const evaluate = async () => {
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
    <AppShell navbar={
      <NavbarMinimalColored
        handleUploadFile={handleUploadFile}
        downloadLinkRef={downloadLinkRef}
        saveBpmn={saveBpmn}
        evaluate={evaluate}
      />}
      aside={
        <Aside height="100vh"
          width={{ base: 250 }}>
          <Box id="properties" />
        </Aside>
      }>
      <Box id="canvas" style={{ height: result ? '50vh' : '100%' }} />

      {result ?
        <>
          <Divider h="my" />
          <SimpleGrid cols={2}>
            <Box>
              <Table highlightOnHover fontSize="md">
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>Criteria</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr onClick={() => setLogType('time')} style={{ cursor: 'pointer' }}>
                    <td>1</td>
                    <td>Total Cycle Time</td>
                    <td>{result?.currentCycleTime}</td>
                  </tr>
                  <tr onClick={() => setLogType('quality')} style={{ cursor: 'pointer' }}>
                    <td>2</td>
                    <td>Quality</td>
                    <td>{result?.quality}</td>
                  </tr>
                  <tr onClick={() => setLogType('flexibility')} style={{ cursor: 'pointer' }}>
                    <td>3</td>
                    <td>Flexibility</td>
                    <td>{result?.flexibility}</td>
                  </tr>
                </tbody>
              </Table>
            </Box>
            <Box>
              {(() => {
                switch (logType) {
                  default:
                  case 'time':
                    return (
                      <ScrollArea style={{ height: '45vh' }}>
                        <Text weight={600} size="lg">Total cycle time Log</Text>
                        <Space h="md" />
                        <Card data={result?.logsCycleTime} level={1} />
                      </ScrollArea>)
                  case 'quality':
                    return (
                      <ScrollArea style={{ height: '45vh' }}>
                        <Text weight={600} size="lg">Quality Log</Text>
                        <Text weight={600} size="md">Total loops' cycle time: <span style={{ fontWeight: 500 }}>{result?.totalCycleTimeAllLoops}</span></Text>
                        {result?.logsQuality.map((log) =>
                          <MantineAccordion defaultValue={log.text}>
                            <MantineAccordion.Item value={log.text}>
                              <MantineAccordion.Control><Text weight={600} size="md">{log.text}</Text></MantineAccordion.Control>
                              <MantineAccordion.Panel>
                                <Text size="md"><Text weight={600} span>Start Gateway: </Text>{log.start}</Text>
                                <Text size="md"><Text weight={600} span>End Gateway: </Text>{log.end}</Text>
                                <Text size="md"><Text weight={600} span>Repetition Work: </Text>{log.reworkProbability}</Text>
                                <Text size="md"><Text weight={600} span>Cycle Time: </Text>{log.cycleTime}</Text>
                              </MantineAccordion.Panel>
                            </MantineAccordion.Item>
                          </MantineAccordion>
                        )}
                      </ScrollArea>)
                  case 'flexibility':
                    return (
                      <ScrollArea style={{ height: '45vh' }}>
                        <Text weight={600} size="lg">Flexibility Log</Text>
                        <Text weight={600} size="md">Number of total tasks: <span style={{ fontWeight: 500 }}>{result?.numberOfTotalTasks}</span></Text>
                        <Text weight={600} size="md">Number of optional tasks: <span style={{ fontWeight: 500 }}>{result?.numberOfOptionalTasks}</span></Text>
                        {result?.logsFlexibility.map((log) =>
                          <MantineAccordion defaultValue={log.text}>
                            <MantineAccordion.Item value={log.text}>
                              <MantineAccordion.Control><Text weight={600} size="md">{log.text}</Text></MantineAccordion.Control>
                              <MantineAccordion.Panel>
                                {log.taskIDs?.map((taskID, index) => <Text size="md">{index + 1}. {taskID}</Text>)}
                              </MantineAccordion.Panel>
                            </MantineAccordion.Item>
                          </MantineAccordion>
                        )}
                      </ScrollArea>)
                }
              }
              )()}
            </Box>
          </SimpleGrid>
        </> : null}
    </AppShell>
  );
}

export default App;
