import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

export default function (element) {
  return [
    {
      id: 'branchingPropability',
      element,
      component: Branching,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function Branching(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return element.businessObject.branchingProbability || '';
  }

  const setValue = value => {
    return modeling.updateProperties(element, {
      branchingProbability: value,
      name: value
    });
  }

  return <TextFieldEntry
    id={id}
    element={element}
    label={translate('Branching Propablities')}
    getValue={getValue}
    setValue={setValue}
    debounce={debounce}
  />
}
