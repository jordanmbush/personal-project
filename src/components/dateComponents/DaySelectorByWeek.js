import React from 'react';


export default function DaySelectorByWeek(props) {
	const { selectedDays, updateDays } = props;
	
	return (
		<div className="week-days-selector days-selector">
			<h2>Select the days of the week that this bill will occur:</h2>
			<input type="checkbox" id="day-1" className="week-day day-box" checked={selectedDays.indexOf(1) !== -1} onClick={ e => updateDays(e.target, 'weekDays')}/>
			<label for="day-1">Su</label>
			<input type="checkbox" id="day-2" className="week-day day-box" checked={selectedDays.indexOf(2) !== -1} onClick={ e => updateDays(e.target, 'weekDays')}/>
			<label for="day-2">Mo</label>
			<input type="checkbox" id="day-3" className="week-day day-box" checked={selectedDays.indexOf(3) !== -1} onClick={ e => updateDays(e.target, 'weekDays')}/>
			<label for="day-3">Tu</label>
			<input type="checkbox" id="day-4" className="week-day day-box" checked={selectedDays.indexOf(4) !== -1} onClick={ e => updateDays(e.target, 'weekDays')}/>
			<label for="day-4">We</label>
			<input type="checkbox" id="day-5" className="week-day day-box" checked={selectedDays.indexOf(5) !== -1} onClick={ e => updateDays(e.target, 'weekDays')}/>
			<label for="day-5">Th</label>
			<input type="checkbox" id="day-6" className="week-day day-box" checked={selectedDays.indexOf(6) !== -1} onClick={ e => updateDays(e.target, 'weekDays')}/>
			<label for="day-6">Fr</label>
			<input type="checkbox" id="day-7" className="week-day day-box" checked={selectedDays.indexOf(7) !== -1} onClick={ e => updateDays(e.target, 'weekDays')}/>
			<label for="day-7">Sa</label>
		</div>
	)
}