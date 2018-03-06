import React from 'react';


export default function DaySelectorByWeek(props) {
	const { selectorSection, selectedDays, updateDays } = props;
	
	// =======================================
	// WEEK DAYS ARE ON A ZERO BASED INDEX!!!!
	// =======================================
	return (
		<div id={`${selectorSection}-selector`} className="week-days-selector days-selector">
			<h2>Select the days of the week that this bill will occur:</h2>
			<input type="checkbox" id={`${selectorSection}-day-0`} className="week-day day-box" checked={selectedDays.indexOf(0) !== -1} onClick={ e => updateDays(e.target)}/>
			<label htmlFor={`${selectorSection}-day-0`}>Su</label>
			<input type="checkbox" id={`${selectorSection}-day-1`} className="week-day day-box" checked={selectedDays.indexOf(1) !== -1} onClick={ e => updateDays(e.target)}/>
			<label htmlFor={`${selectorSection}-day-1`}>Mo</label>
			<input type="checkbox" id={`${selectorSection}-day-2`} className="week-day day-box" checked={selectedDays.indexOf(2) !== -1} onClick={ e => updateDays(e.target)}/>
			<label htmlFor={`${selectorSection}-day-2`}>Tu</label>
			<input type="checkbox" id={`${selectorSection}-day-3`} className="week-day day-box" checked={selectedDays.indexOf(3) !== -1} onClick={ e => updateDays(e.target)}/>
			<label htmlFor={`${selectorSection}-day-3`}>We</label>
			<input type="checkbox" id={`${selectorSection}-day-4`} className="week-day day-box" checked={selectedDays.indexOf(4) !== -1} onClick={ e => updateDays(e.target)}/>
			<label htmlFor={`${selectorSection}-day-4`}>Th</label>
			<input type="checkbox" id={`${selectorSection}-day-5`} className="week-day day-box" checked={selectedDays.indexOf(5) !== -1} onClick={ e => updateDays(e.target)}/>
			<label htmlFor={`${selectorSection}-day-5`}>Fr</label>
			<input type="checkbox" id={`${selectorSection}-day-6`} className="week-day day-box" checked={selectedDays.indexOf(6) !== -1} onClick={ e => updateDays(e.target)}/>
			<label htmlFor={`${selectorSection}-day-6`}>Sa</label>
		</div>
	)
}