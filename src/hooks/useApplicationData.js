import { useState, useEffect } from "react";
const axios = require("axios");

export default function useApplicationData() {
  
  const [state, setState] = useState({
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {}
  });

  useEffect(() => { 
    Promise.all([
    axios.get(`/api/days`),
    axios.get(`/api/appointments`),
    axios.get(`/api/interviewers`)])
    .then((all) => {
      setState(prev => ({...prev, days: all[0].data, appointments: all[1].data, interviewers: all[2].data}));
      console.log(all[2]);
    });
  }, [])  

const setDay = day => setState({ ...state, day });

function bookInterview(id, interview) {
  console.log(`hell?`, id, interview)
  return axios.put(
    `/api/appointments/${id}`,
    { interview: { ...interview } }
  ).then(() => {
    console.log(`hello raj`)
    const appointment = {
      ...state.appointments[id],
      interview: { ...interview }
    };
    const appointments = {
      ...state.appointments,
      [id]: appointment
    };

    setState(prev => ({ ...prev, appointments }));
    console.log(`hello???`)
  })
}

function cancelInterview(id) {
  return axios.delete(`/api/appointments/${id}`)
    .then(() => {
      const appointment = {
        ...state.appointments[id],
        interview: null
      }
      const appointments = {
        ...state.appointments,
        [id]: appointment
      }
      setState(prev => ({ ...prev, appointments }));
    })
}

useEffect(() => {
  if (state.days.length > 0) {
    spotsRemaining();
  }
}, [state.appointments]);

// update spots remaining value when saving or deleting appointments
function spotsRemaining() {
  // find index in the days array
  const index = state.days.findIndex(item => item.name === state.day);
  // get appointments array on that day
  const appointments = state.days[index].appointments
  // count appointments which have null interview value
  const spots = appointments.filter(item => !state.appointments[item].interview).length;
  // copy day object from state and replace spots
  const day = {
    ...state.days[index],
    spots
  }
  // const days = [...state.days].splice(index, 1, day); // this returns only the deleted element
  // copy days array from state and replace with updated day object
  const days = [...state.days]
  days.splice(index, 1, day);
  // update state withe updated days array
  setState(prev => ({ ...prev, days }));
}

return { state, setDay, bookInterview, cancelInterview }
}