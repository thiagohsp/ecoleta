import React , { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { Link, useHistory } from 'react-router-dom'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import './styles.css';
import logo from '../../assets/logo.svg'
import api from '../../services/api'
import Dropzone from "../../components/Dropzone";

interface Item {
  id: number,
  title: string,
  image_url: string 
}
interface IBGECityResponse {
  nome: string 
}
interface IBGEUfResponse {
  sigla: string 
}

const CreatePoint = () => {
  
  const [ items, setItems ] = useState<Item[]>([]);
  const [ ufs, setUfs ] = useState<string[]>([]);
  const [ cities, setCities ] = useState<string[]>([]);  
  const [ selectedUf, setSelectedUf ] = useState<string>('');
  const [ selectedCity, setSelectedCity ] = useState<string>('');
  const [ selectedPosition, setSelectedPosition ] = useState<[number,number]>([0,0]);
  const [ initialPosition, setInitialPosition ] = useState<[number,number]>([0,0]);
  const [ selectedItem, setSelectedItem ] = useState<number[]>([]);
  const [ selectedFile , setSelectedFile ] = useState<File>();
  const [ formData, setFormData ] = useState({
    name      : '',
    email     : '',
    whatsapp  : '',
  });
  
  const history = useHistory();

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value
    setSelectedUf(uf);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value
    setSelectedCity(city);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const {name, value} = event.target;
    setFormData({...formData, [name] : value})
  }

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItem.findIndex(item => item === id);
    if (alreadySelected >= 0) {
      const filteredItems = selectedItem.filter(item => item !== id)
      setSelectedItem(filteredItems)
    } else{
      setSelectedItem([...selectedItem, id])
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItem;
    const data = new FormData();
    data.append('name',name);
    data.append('email',email);
    data.append('whatsapp',whatsapp);
    data.append('uf',uf);
    data.append('city',city);
    data.append('latitude',String(latitude));
    data.append('longitude',String(longitude));
    data.append('items',items.join(','));
    if (selectedFile) {
      data.append('image', selectedFile)
    }
    
    
    api.post('/points', data)
    alert('Ponto de Coleta criado com sucesso!')
    history.push('/');
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position =>{
      const { latitude, longitude } = position.coords
      setInitialPosition([latitude, longitude])
      setSelectedPosition([latitude, longitude])
    })
  }, []);
  
  useEffect(()=>{
    api.get('items').then(response => {
      setItems(response.data);
    })    
  },[]);

  useEffect(()=>{
    api.get<IBGEUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(response => {
        const ufInitials = response.data.map(uf => uf.sigla)
        setUfs(ufInitials);
    })
  },[]);

  useEffect(()=>{    
    if (selectedUf === '0') return;
    api.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`)
      .then(response => {
        const cities = response.data.map(city => city.nome)
        setCities(cities);
    })
  },[selectedUf]);
  
  return (
    <div id="page-create-point">
      <div className="content">
        <header>
          <img src={logo} alt="Ecoleta - Coleta de Resíduos"/>
          <Link to="/">
            <FiArrowLeft /> 
            <strong>Voltar para Home</strong>
          </Link>
        </header>
        <form onSubmit={handleSubmit}>
          <h1>Cadastro do <br/> ponto de coleta</h1>
          <Dropzone onFileUploaded={setSelectedFile}/>
          <fieldset>
            <legend>
              <h2>Dados</h2>
            </legend>
            <div className="field">
              <label htmlFor="name">Nome da Entidade</label>
              <input  
                type="text"
                name="name"
                id="name"
                onChange={handleInputChange}/>
            </div>
            <div className="field-group">
              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input 
                  type="text"
                  name="email"
                  id="email"
                  onChange={handleInputChange}/>
              </div>
              <div className="field">
                <label htmlFor="whatsapp">Whatsapp</label>
                <input 
                  type="text"
                  name="whatsapp"
                  id="whatsapp"
                  onChange={handleInputChange}/>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Endereço</h2>
              <span>Selecione o endereço no mapa</span>
            </legend>
            <div>
            <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={selectedPosition}/>
            </Map>
            </div>
            <div className="field-group">
              <div className="field">
                <label htmlFor="uf">Estado (UF)</label>
                  <select name="uf"id="uf" value={selectedUf} onChange={handleSelectUf}>
                    <option value="0">Selecione o estado</option>
                    {ufs && ufs.map(uf => (
                      <option key={uf} value={uf}> {uf} </option>)
                    )}
                  </select>
              </div>
              <div className="field">
                <label htmlFor="city">Cidade</label>
                <select name="city"id="city" value={selectedCity} onChange={handleSelectCity}>
                  <option value="0">Selecione a cidade</option>
                  {cities && cities.map(city => (
                    <option key={city} value={city}> {city} </option>)
                  )}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Itens de Coleta</h2>
              <span>Selecione um ou mais itens abaixo</span>
            </legend>
            <ul className="items-grid">
              {items && items.map(item => 
                (<li key={item.id} className={selectedItem.includes(item.id) ? "selected" : ""} onClick={()=> {handleSelectItem(item.id)}}>
                  <img src={item.image_url} alt={item.title}/>
                  <span>{item.title}</span>
                </li>)
              )}
            </ul>
          </fieldset>

          <button type="submit">Cadastrar ponto de coleta</button>
        </form>
      </div>
    </div>
  )
}

export default CreatePoint;