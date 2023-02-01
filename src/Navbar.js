import { Navbar, Center, Tooltip, createStyles, Stack, Text, Anchor, Accordion, ScrollArea, Button } from '@mantine/core';
import {
  IconFileImport,
  IconFileExport,
  IconCalculator,
} from '@tabler/icons';
import { useRef } from 'react';
import { assign } from 'min-dash';
import { getDi } from 'bpmn-js/lib/util/ModelUtil';

const useStyles = createStyles((theme) => ({
  link: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.white,
    opacity: 0.85,

    '&:hover': {
      opacity: 1,
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: 'filled', color: theme.primaryColor }).background,
        0.1
      ),
    },
  },
}));


function NavbarActions({ icon: Icon, label, onClick }) {
  const { classes } = useStyles();
  return (
    <Tooltip label={label} position="right" transitionDuration={0}>
      <Button onClick={onClick} className={classes.link}>
        <Icon stroke={1.5} size={30} />
      </Button>
    </Tooltip>
  );
}

export function NavbarMinimalColored({ handleUploadFile, downloadLinkRef, saveBpmn, evaluate, modeler }) {
  const uploadLinkRef = useRef(null);

  const handleGateway = (event, type, options) => {
    event.stopPropagation();
    if (modeler) {
      //@ts-ignore
      const elementFactory = modeler.get('elementFactory');
      //@ts-ignore
      const create = modeler.get('create');

      var shape = elementFactory.createShape(assign({ type: type }, options));
      if (options) {
        var di = getDi(shape);
        di.isExpanded = options.isExpanded;
      }
      create.start(event, shape);
    }
  };

  return (
    <Navbar
      height="100vh"
      width={{ base: 256 }}
      p="md"
      sx={(theme) => ({
        backgroundColor: theme.fn.variant({ variant: 'filled', color: theme.primaryColor })
          .background,
      })}
    >
      <Center>
        <Text color="white" size="xl" weight={600}>BPE</Text>
      </Center>
      <ScrollArea>
        <Navbar.Section grow mt={50}>
          {/* <Stack justify="center" spacing={0}>
            <input
              type="file"
              onChange={handleUploadFile}
              ref={uploadLinkRef}
              style={{ display: 'none' }}
            />
            <NavbarActions
              icon={IconFileImport}
              label="Import file"
              onClick={() => uploadLinkRef.current.click()}
            />
            <Anchor onClick={saveBpmn} href="#" ref={downloadLinkRef} download>
              <NavbarActions
                icon={IconFileExport}
                label="Export file"
                onClick={() => { }}
              />
            </Anchor>
            <NavbarActions
              icon={IconCalculator}
              label="Evaluate model"
              onClick={evaluate}
            />
          </Stack> */}
          <Accordion defaultValue="gateway">
            <Accordion.Item value="gateway">
              <Accordion.Control ><Text weight={600} size="md">Gateway</Text></Accordion.Control>
              <Accordion.Panel>
                <Stack>
                  <button
                    className="bpmn-icon-gateway-xor custom-entry"
                    onClick={(e) => handleGateway(e, 'bpmn:ExclusiveGateway')}
                    onDragStart={(e) => handleGateway(e, 'bpmn:ExclusiveGateway')}
                    draggable="true"
                  >
                    {' '}
                    Exclusive Gateway
                  </button>
                  <button
                    className="bpmn-icon-gateway-or custom-entry"
                    onClick={(e) => handleGateway(e, 'bpmn:InclusiveGateway')}
                    onDragStart={(e) => handleGateway(e, 'bpmn:InclusiveGateway')}
                    draggable="true"
                  >
                    {' '}
                    Inclusive Gateway
                  </button>
                  <button
                    className="bpmn-icon-gateway-parallel custom-entry"
                    onClick={(e) => handleGateway(e, 'bpmn:ParallelGateway')}
                    onDragStart={(e) => handleGateway(e, 'bpmn:ParallelGateway')}
                    draggable="true"
                  >
                    {' '}
                    Parallel Gateway
                  </button>
                  <button
                    className="bpmn-icon-gateway-complex custom-entry"
                    onClick={(e) => handleGateway(e, 'bpmn:ComplexGateway')}
                    onDragStart={(e) => handleGateway(e, 'bpmn:ComplexGateway')}
                    draggable="true"
                  >
                    {' '}
                    Complex Gateway
                  </button>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="tasks">
              <Accordion.Control ><Text weight={600} size="md">Tasks</Text></Accordion.Control>
              <Accordion.Panel>
                <Stack>
                  <button
                    className="bpmn-icon-task custom-entry"
                    onClick={(e) => handleGateway(e, 'bpmn:Task')}
                    onDragStart={(e) => handleGateway(e, 'bpmn:Task')}
                    draggable="true"
                  >
                    Task
                  </button>
                  <button
                    className="bpmn-icon-user-task custom-entry"
                    onClick={(e) => handleGateway(e, 'bpmn:UserTask')}
                    onDragStart={(e) => handleGateway(e, 'bpmn:UserTask')}
                    draggable="true"
                  >
                    User Task
                  </button>
                  <button
                    className="bpmn-icon-business-rule-task custom-entry"
                    onClick={(e) => handleGateway(e, 'bpmn:BusinessRuleTask')}
                    onDragStart={(e) => handleGateway(e, 'bpmn:BusinessRuleTask')}
                    draggable="true"
                  >
                    Business Rule Task
                  </button>
                  <button
                    className="bpmn-icon-manual-task custom-entry"
                    onClick={(e) => handleGateway(e, 'bpmn:ManualTask')}
                    onDragStart={(e) => handleGateway(e, 'bpmn:ManualTask')}
                    draggable="true"
                  >
                    Manual Task
                  </button>
                  <button
                    className="bpmn-icon-receive-task custom-entry"
                    onClick={(e) => handleGateway(e, 'bpmn:ReceiveTask')}
                    onDragStart={(e) => handleGateway(e, 'bpmn:ReceiveTask')}
                    draggable="true"
                  >
                    Receive Task
                  </button>
                  <button
                    className="bpmn-icon-send-task custom-entry"
                    onClick={(e) => handleGateway(e, 'bpmn:SendTask')}
                    onDragStart={(e) => handleGateway(e, 'bpmn:SendTask')}
                    draggable="true"
                  >
                    Send Task
                  </button>
                  <button
                    className="bpmn-icon-script-task custom-entry"
                    onClick={(e) => handleGateway(e, 'bpmn:ScriptTask')}
                    onDragStart={(e) => handleGateway(e, 'bpmn:ScriptTask')}
                    draggable="true"
                  >
                    Script Task
                  </button>
                  <button
                    className="bpmn-icon-service-task custom-entry"
                    onClick={(e) => handleGateway(e, 'bpmn:ServiceTask')}
                    onDragStart={(e) => handleGateway(e, 'bpmn:ServiceTask')}
                    draggable="true"
                  >
                    Service Task
                  </button>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="events">
              <Accordion.Control ><Text weight={600} size="md">Events</Text></Accordion.Control>
              <Accordion.Panel>
                <Stack>
                  <button
                    className="bpmn-icon-start-event-none custom-entry"
                    onClick={(e) => handleGateway(e, 'bpmn:StartEvent')}
                    onDragStart={(e) => handleGateway(e, 'bpmn:StartEvent')}
                    draggable="true"
                  >
                    Start Event
                  </button>
                  <button
                    className="bpmn-icon-end-event-none custom-entry"
                    onClick={(e) => handleGateway(e, 'bpmn:EndEvent')}
                    onDragStart={(e) => handleGateway(e, 'bpmn:EndEvent')}
                    draggable="true"
                  >
                    End Event
                  </button>
                  <button
                    className="bpmn-icon-intermediate-event-none custom-entry"
                    onClick={(e) => handleGateway(e, 'bpmn:IntermediateThrowEvent')}
                    onDragStart={(e) => handleGateway(e, 'bpmn:IntermediateThrowEvent')}
                    draggable="true"
                  >
                    Intermediate Event
                  </button>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Navbar.Section>
      </ScrollArea>
    </Navbar>
  );
}