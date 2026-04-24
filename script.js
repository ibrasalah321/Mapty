'use strict';




const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const workoutContainer = document.querySelector('.workouts')


class Workout{
    date = new Date();
    formatted = this.date.toISOString().split('T')[0]
    id = (Date.now() + '').slice(-10)
    constructor(coords,distance,duration){
        this.coords = coords;
        this.distance = distance; // in km
        this.duration = duration; // in min
    }
    _setDescraption(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.descraption = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

class Running extends Workout{
    type = 'running'
    constructor(coords,distance,duration,cadence){
        super(coords,distance,duration)
        this.cadence = cadence
        this.calcPace()
        this._setDescraption()

    }
    calcPace(){
        // min/km
        this.pace = this.duration/this.distance;
        return this.pace
    }
}
class Cycling extends Workout{
    type = 'cycling'
    constructor(coords,distance,duration,elevation){
        super(coords,distance,duration)
        this.elevation = elevation
        this.calcSpeed()
        this._setDescraption()

    }
    calcSpeed(){
        // km/h
        this.speed = this.distance/(this.duration / 60);
        return this.speed
    }
}

class App {
    _map;
    _mapEvent;
    _workouts = [];

    constructor(){
        
        this._getPosition();
        this._getFromLocalStorage()
        form.addEventListener('submit',this._newWorkout.bind(this))
        inputType.addEventListener('change',this._toggleElevationField)
        workoutContainer.addEventListener('click',this._moveToPopup.bind(this))
    }
    
    _getPosition(){
        if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>{
        alert('erro')
        })
    }
    }

    _loadMap(position){
        
            console.log(position)
            const {latitude,longitude} = position.coords
            console.log(latitude,longitude)
            const coords = [latitude,longitude]
            this._map = L.map('map').setView(coords, 13);
            console.log(this._map)

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this._map);
            this._workouts.forEach(work => {
                this.renderWorkoutMarker(work);
            });
            this._map.on('click', this._showForm.bind(this))
    }
    _showForm(mapE){
                this._mapEvent = mapE;
                form.classList.remove('hidden')
                inputDistance.focus();
                // console.log(mapEvent)
                
    }
    _hideForm(){
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = '';
        form.style.display = 'none'; // إخفاء فوري لتجنب القفز
        form.classList.add('hidden');
        setTimeout(() => (form.style.display = 'grid'), 1000); // إعادة العرض كـ grid بعد ثانية (وهو مخفي بـ class hidden)  
    }
    
    _toggleElevationField(){
        
            inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        
    }
    _newWorkout(e){
        e.preventDefault()
        const {lat,lng} = this._mapEvent.latlng;
        let workout;
        const allValuesPostive = (...inputs) => inputs.every(inp => inp > 0)
        // get data


        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;

        // check data
        if(type === 'running'){
            const cadence = +inputCadence.value;
            if(!allValuesPostive(distance,duration,cadence)) return alert('wrong')
            workout = new Running([lat,lng],distance,duration,cadence)
        }
        if(type === 'cycling'){
            const elevation = +inputElevation.value;
            if(!allValuesPostive(distance,duration)) return alert('wrong')
            workout = new Cycling([lat,lng],distance,duration,elevation)
        }
        console.log(this)

        this._workouts.push(workout)
        this._setTolocalStorage()
        
        this.renderWorkoutMarker(workout)
        this.renderWorkoutOnList(workout)

        this._hideForm()
    }

    renderWorkoutMarker(workout){
        L.marker(workout.coords).addTo(this._map)
            .bindPopup(L.popup({
                minWidth:100,
                maxWidth:250,
                autoClose:false,
                closeOnClick:false,
                className:`${workout.type}-popup`
            }))
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.descraption}`)
            .openPopup();
    }
    renderWorkoutOnList(workout){
        let markup = `
        
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.descraption}</h2>
            <div class="workout__details">
                <span class="workout__icon">${workout.type === 'running' ?  '🏃‍♂️':'🚴‍♀️'}</span>
                <span class="workout__value">${workout.distance}</span>
                <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
            </div>
            `
            if(workout.type === 'running'){
                markup+=`
                <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">m</span>
            </div>
            </li> 
            `;
            if(workout.type === 'cycling'){
                markup+=`
                <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.elevation}</span>
                <span class="workout__unit">m</span>
            </div>
            </li> 
                `
            }
            
        }
    
    form.insertAdjacentHTML('afterend',markup)   
    
    }
    _moveToPopup(e){
        const workoutEl = e.target.closest('.workout')

        console.log(workoutEl)
        if(!workoutEl) return
        const workout = this._workouts.find(workout => workout.id === workoutEl.dataset.id)
        this._map.setView(workout.coords, 13, {
        animate: true,
        pan: {
            duration: 1,
        },
    });
    }
    _setTolocalStorage(){
        localStorage.setItem('workouts',JSON.stringify(this._workouts))
    }
    _getFromLocalStorage(){
        const storage = localStorage.getItem('workouts')
        if(storage){
            this._workouts = JSON.parse(storage)
        }
        this._workouts.forEach(workout => {
            this.renderWorkoutOnList(workout);
        })
    }
}

const app = new App()


