import React from 'react';
import '../input/index.css';
import './index.css';

/**
 * Interface representing the props for the Checkbox component.
 *
 * - title - The label to display
 * - hint - An optional helper text providing additional information.
 * - id - The unique identifier for the input field.
 * - val - The current value of the input field.
 * - setState - Callback function to update the state with the input field's value.
 * - err - An error message displayed if there's an issue with the input.
 */
interface CheckboxProps {
  title: string;
  hint?: string;
  id: string;
  val: boolean;
  setState: (value: boolean) => void;
}

/**
 * Checkbox component renders a customizable checkbox with optional title, hint,
 * and error message.
 *
 * @param title - The label of the checkbox.
 * @param hint - Optional text providing additional instructions.
 * @param id - The unique identifier of the checkbox element.
 * @param val - The current value of the checkbox.
 * @param setState - The function to update the state of the checkbox value.
 * @param err - Optional error message displayed when there's an issue with input.
 */
const Checkbox = ({ title, hint, id, val, setState }: CheckboxProps) => (
  <>
    <div className='input_title'> {title} </div>
    <div className='inline-checkbox-hint'>
      <input
        id={id}
        type='checkbox'
        checked={val}
        onChange={e => {
          setState(e.target.checked);
        }}
      />
      {hint && <div className='input_hint'>{hint}</div>}
    </div>
  </>
);

export default Checkbox;
