import { useEffect, useRef, useState } from "react";
import { Anchor, Box, Button, Center, createStyles, Group, Header, Space, Text, Tooltip } from "@mantine/core";
import { IconFileImport, IconFileExport, IconCalculator, IconHandGrab, IconPictureInPictureTop, IconSpacingHorizontal, IconArrowsDoubleNeSw } from '@tabler/icons';

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
    <Tooltip label={label} position="bottom" transitionDuration={0}>
      <Button onClick={onClick} className={classes.link}>
        <Icon stroke={1.5} size={30} />
      </Button>
    </Tooltip>
  );
}

export default function BpeHeader(
  {
    handleUploadFile,
    downloadLinkRef,
    saveBpmn,
    evaluate,
    modeler
  }) {
  const uploadLinkRef = useRef(null);
  const { theme } = useStyles();
  const [handTool, setHandTool] = useState();
  const [lassoTool, setLassoTool] = useState();
  const [spaceTool, setSpaceTool] = useState();
  const [globalConnect, setGlobalConnect] = useState();

  useEffect(() => {
    if (modeler) {
      setHandTool(modeler.get('handTool'));
      setLassoTool(modeler.get('lassoTool'));
      setSpaceTool(modeler.get('spaceTool'));
      setGlobalConnect(modeler.get('globalConnect'));
    }
  }, [modeler]);

  return <Header height={60} p={0}>
    <Group>
      <Box sx={(theme) => ({
        width: 256,
        height: '100%',
      })}>
        <Center>
          <Text color={theme.primaryColor} size="xl" weight={600}>
            BPE
          </Text>
        </Center>
      </Box>
      <Group pt={5}>
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
          />
        </Anchor>
        <NavbarActions icon={IconCalculator} label="Evaluate model" onClick={evaluate} />
      </Group>
      <Space w="xl" />
      <Group pt={5}>
        <NavbarActions icon={IconHandGrab} label="Activate Hand Tool"
          onClick={(event) => handTool.activateHand(event)} />
        <NavbarActions icon={IconPictureInPictureTop} label="Activate Lasso Tool"
          onClick={(event) => lassoTool.activateSelection(event)} />
        <NavbarActions icon={IconSpacingHorizontal} label="Activate Space Tool"
          onClick={(event) => spaceTool.activateSelection(event)} />
        <NavbarActions icon={IconArrowsDoubleNeSw} label="Activate Global Connector Tool"
          onClick={(event) => globalConnect.start(event)} />
      </Group>
    </Group>
  </Header>
}