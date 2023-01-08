import { Navbar, Center, Tooltip, UnstyledButton, createStyles, Stack, Text, Anchor } from '@mantine/core';
import {
  IconFileImport,
  IconFileExport,
  IconCalculator,
} from '@tabler/icons';
import { useRef } from 'react';

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
      <UnstyledButton onClick={onClick} className={classes.link}>
        <Icon stroke={1.5} size={30} />
      </UnstyledButton>
    </Tooltip>
  );
}

export function NavbarMinimalColored({ handleUploadFile, downloadLinkRef, saveBpmn, evaluate }) {
  const uploadLinkRef = useRef(null);

  return (
    <Navbar
      height={750}
      width={{ base: 80 }}
      p="md"
      sx={(theme) => ({
        backgroundColor: theme.fn.variant({ variant: 'filled', color: theme.primaryColor })
          .background,
      })}
    >
      <Center>
        <Text color="white" size="xl" weight={600}>BPE</Text>
      </Center>
      <Navbar.Section grow mt={50}>
        <Stack justify="center" spacing={0}>
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
        </Stack>
      </Navbar.Section>
    </Navbar>
  );
}