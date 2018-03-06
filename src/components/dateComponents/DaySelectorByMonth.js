import React from 'react';


export default function DaySelectorByMonth({ selectorSection, selectedDays, updateDays }) {
	
	return (
		<div id={`${selectorSection}-selector`} className="month-days-container">
			<h2>Select the days of the month that this bill will occur:</h2>
      <small>If you choose a day that does not exist in all months, the bill will appear for the last day that month.</small>
      <div className="month-days-selector days-selector">
        <input type="checkbox" id={`${selectorSection}-month-day-1`} value={1} className="day-box month-day" checked={selectedDays.indexOf(1) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-1`}>1</label>
        <input type="checkbox" id={`${selectorSection}-month-day-2`} value={2} className="day-box month-day" checked={selectedDays.indexOf(2) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-2`}>2</label>
        <input type="checkbox" id={`${selectorSection}-month-day-3`} value={3} className="day-box month-day" checked={selectedDays.indexOf(3) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-3`}>3</label>
        <input type="checkbox" id={`${selectorSection}-month-day-4`} value={4} className="day-box month-day" checked={selectedDays.indexOf(4) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-4`}>4</label>
        <input type="checkbox" id={`${selectorSection}-month-day-5`} value={5} className="day-box month-day" checked={selectedDays.indexOf(5) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-5`}>5</label>
        <input type="checkbox" id={`${selectorSection}-month-day-6`} value={6} className="day-box month-day" checked={selectedDays.indexOf(6) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-6`}>6</label>
        <input type="checkbox" id={`${selectorSection}-month-day-7`} value={7} className="day-box month-day" checked={selectedDays.indexOf(7) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-7`}>7</label>

        <input type="checkbox" id={`${selectorSection}-month-day-8`} value={8} className="day-box month-day" checked={selectedDays.indexOf(8) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-8`}>8</label>
        <input type="checkbox" id={`${selectorSection}-month-day-9`} value={9} className="day-box month-day" checked={selectedDays.indexOf(9) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-9`}>9</label>
        <input type="checkbox" id={`${selectorSection}-month-day-10`} value={10} className="day-box month-day" checked={selectedDays.indexOf(10) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-10`}>10</label>
        <input type="checkbox" id={`${selectorSection}-month-day-11`} value={11} className="day-box month-day" checked={selectedDays.indexOf(11) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-11`}>11</label>
        <input type="checkbox" id={`${selectorSection}-month-day-12`} value={12} className="day-box month-day" checked={selectedDays.indexOf(12) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-12`}>12</label>
        <input type="checkbox" id={`${selectorSection}-month-day-13`} value={13} className="day-box month-day" checked={selectedDays.indexOf(13) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-13`}>13</label>
        <input type="checkbox" id={`${selectorSection}-month-day-14`} value={14} className="day-box month-day" checked={selectedDays.indexOf(14) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-14`}>14</label>

        <input type="checkbox" id={`${selectorSection}-month-day-15`} value={15} className="day-box month-day" checked={selectedDays.indexOf(15) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-15`}>15</label>
        <input type="checkbox" id={`${selectorSection}-month-day-16`} value={16} className="day-box month-day" checked={selectedDays.indexOf(16) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-16`}>16</label>
        <input type="checkbox" id={`${selectorSection}-month-day-17`} value={17} className="day-box month-day" checked={selectedDays.indexOf(17) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-17`}>17</label>
        <input type="checkbox" id={`${selectorSection}-month-day-18`} value={18} className="day-box month-day" checked={selectedDays.indexOf(18) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-18`}>18</label>
        <input type="checkbox" id={`${selectorSection}-month-day-19`} value={19} className="day-box month-day" checked={selectedDays.indexOf(19) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-19`}>19</label>
        <input type="checkbox" id={`${selectorSection}-month-day-20`} value={20} className="day-box month-day" checked={selectedDays.indexOf(20) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-20`}>20</label>
        <input type="checkbox" id={`${selectorSection}-month-day-21`} value={21} className="day-box month-day" checked={selectedDays.indexOf(21) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-21`}>21</label>


        <input type="checkbox" id={`${selectorSection}-month-day-22`} value={22} className="day-box month-day" checked={selectedDays.indexOf(22) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-22`}>22</label>
        <input type="checkbox" id={`${selectorSection}-month-day-23`} value={23} className="day-box month-day" checked={selectedDays.indexOf(23) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-23`}>23</label>
        <input type="checkbox" id={`${selectorSection}-month-day-24`} value={24} className="day-box month-day" checked={selectedDays.indexOf(24) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-24`}>24</label>
        <input type="checkbox" id={`${selectorSection}-month-day-25`} value={25} className="day-box month-day" checked={selectedDays.indexOf(25) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-25`}>25</label>
        <input type="checkbox" id={`${selectorSection}-month-day-26`} value={26} className="day-box month-day" checked={selectedDays.indexOf(26) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-26`}>26</label>
        <input type="checkbox" id={`${selectorSection}-month-day-27`} value={27} className="day-box month-day" checked={selectedDays.indexOf(27) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-27`}>27</label>
        <input type="checkbox" id={`${selectorSection}-month-day-28`} value={28} className="day-box month-day" checked={selectedDays.indexOf(28) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-28`}>28</label>


        <input type="checkbox" id={`${selectorSection}-month-day-29`} value={29} className="day-box month-day" checked={selectedDays.indexOf(29) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-29`}>29</label>
        <input type="checkbox" id={`${selectorSection}-month-day-30`} value={30} className="day-box month-day" checked={selectedDays.indexOf(30) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-30`}>30</label>
        <input type="checkbox" id={`${selectorSection}-month-day-31`} value={31} className="day-box month-day" checked={selectedDays.indexOf(31) !== -1} onClick={ (e) => updateDays(e.target)} />
        <label htmlFor={`${selectorSection}-month-day-31`}>31</label>
      </div>
    </div>
	)
}