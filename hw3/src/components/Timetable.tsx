import axios from "axios";
import { useEffect, useState } from "react";
import { datesBetween, valid } from "@/lib/utils"

type TimetableProps = {
    isParticipating: boolean;
    username: string;
    eventId: number;
    participationCount: number;
}

type EventTimeType = {
    startTime: Date;
    endTime: Date;
}

function style(
  isParticipating: boolean, 
  cellNumber: number, 
  cellParticipating: boolean, 
  totalNumber: number
) {
  if (cellNumber == -1) {
    return 'bg-gray-500';
  }
  if (cellNumber == 0) {
    return 'bg-gray-300';
  }
  else {
    const ratio = cellNumber / totalNumber;
    var retStyle;
    for (var i = 1; i <= 6; i++) {
      if (ratio <= i / 6 + 1e-6) {
        retStyle = `bg-green-${i * 100 + 200}`;
        break;
      }
    }
    return retStyle;
  }
  // if (isParticipating && cellParticipating) {
  //   answer = answer + ' border border-pink'
  // }
}

function Timetable({isParticipating, username, eventId, participationCount}: TimetableProps) {
    const [eventTime, setEventTime] = useState<EventTimeType>();
    const [availableCount, setAvailableCount] = useState<number[]>([]);
    const [isAvailable, setIsAvailable] = useState<boolean[]>([]);
    
    
    useEffect(() => {
      const fetchData = async () => {
        const timeRequest = axios.get(`/api/availableTimes/${eventId}`)
        const userRequest = axios.get(`/api/availableTimes/${eventId}?username=${username}`)
        const eventRequest = axios.get(`/api/events/${eventId}`)
        
        const [timeResponse, userResponse, eventResponse] = await Promise.all([timeRequest, userRequest, eventRequest]);

        const timeData = timeResponse.data;
        const userData = userResponse.data;
        const eventData = eventResponse.data;
        
        const eventTime = {
          startTime: new Date(eventData.event.startTime),
          endTime: new Date(eventData.event.endTime)
        };

        const timeCounter = timeData.counter.map((val: number, index: number) => valid(index, eventTime.startTime, eventTime.endTime) ? val : -1);
        const isUserAvailable = userData.counter.map((val: number) => (val > 0 ? true: false));
        
        setEventTime(eventTime);
        setAvailableCount(timeCounter);
        setIsAvailable(isUserAvailable);
      }
      fetchData();
    }, [])
    
    if (!eventTime || availableCount.length == 0) {
      return (
        <div>Loading...</div>
        )
      }
      
    const dates = datesBetween(eventTime.startTime, eventTime.endTime);
    const onCellClick = async (index: number) => {
      const newAvailable = [...isAvailable];
      const newCount = [...availableCount];
      if (isAvailable[index]) {
        try {
          const postData = {
            username,
            eventId,
            availableTime: index,
            isInserting: false
          }
          await axios.post(`/api/availableTimes/${eventId}`, postData);
          newAvailable[index] = false;
          newCount[index] -= 1;
        }
        catch (error) {
          alert(error);
        }
      }
      else {
        try {
          const postData = {
            username,
            eventId,
            availableTime: index,
            isInserting: true
          }
          await axios.post(`/api/availableTimes/${eventId}`, postData);
          newAvailable[index] = true;
          newCount[index] += 1;
        }
        catch (error) {
          alert(error);
        }
      }
      setIsAvailable(newAvailable);
      setAvailableCount(newCount);
    }
    return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"></th> {/* Empty cell */}
              {dates.map(date => (
                <th key={date} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {date}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array(24).fill(0).map((_, hour) => (
              <tr key={hour}>
                <td className="px-1 py-1 text-xs whitespace-nowrap text-center">
                  {String(hour).padStart(2, '0')}
                </td>
                {dates.map((date, dateIndex) => (
                  <td 
                    key={date} 
                    className={`px-6 py-1 border border-white whitespace-nowrap cursor-pointer 
                      ${style(isParticipating, availableCount[dateIndex * 24 + hour] , isAvailable[dateIndex * 24 + hour], participationCount)}`
                    } 
                    onClick={() => onCellClick(dateIndex * 24 + hour)}
                  ></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
}

export default Timetable;