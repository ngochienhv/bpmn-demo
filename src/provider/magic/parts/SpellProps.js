import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

export default function (element) {

  return [
    {
      id: 'cycleTime',
      element,
      component: Spell,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function Spell(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return element.businessObject.cycleTime || '';
  }

  const setValue = value => {
    return modeling.updateProperties(element, {
      cycleTime: value
    });
  }

  return <TextFieldEntry
    id={id}
    element={element}
    label={translate('Cycle Time')}
    getValue={getValue}
    setValue={setValue}
    debounce={debounce}
  />
}
