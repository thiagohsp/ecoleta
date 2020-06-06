import React, { useState, useEffect } from 'react'
import { AppLoading } from 'expo'
import { Feather as Icon } from "@expo/vector-icons";
import { StyleSheet, View, Text, Image, ImageBackground } from 'react-native'
import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';
import { Ubuntu_700Bold, useFonts } from '@expo-google-fonts/ubuntu';
import { RectButton } from 'react-native-gesture-handler'
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from 'react-native-picker-select';
import api from '../../services/api'

interface IBGECityResponse {
  nome: string 
}
interface IBGEUfResponse {
  sigla: string,
  nome: string 
}

interface SelectInputItem {
  label: string,
  value: string
}

const Home = () => {

  const [ ufs, setUfs ] = useState<SelectInputItem[]>([{
    label: '',
    value: ''
  }]);
  const [ cities, setCities ] = useState<SelectInputItem[]>([{
    label: '',
    value: ''
  }]);
  const [ selectedUf, setSelectedUf ] = useState<string>('');
  const [ selectedCity, setSelectedCity ] = useState<string>('');

  useEffect(()=>{
    api.get<IBGEUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(response => {
        console.log(response.data);
        const ufInitials = response.data.map(uf => ({
          value : uf.sigla,
          label : uf.nome 
        }))
        setUfs(ufInitials);
    })
  },[]);

  useEffect(()=>{        
    if (selectedUf === '') return;
    console.log(selectedUf)
    api.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`)
      .then(response => {
        console.log(response.data);
        const cities = response.data.map(city => ({
          value : city.nome,
          label : city.nome 
        }))
        //response.data.map(city => city.nome)
        setCities(cities);
    })
  },[selectedUf]);

  const navigation = useNavigation();

  function handleNavigateToPoints() {
    navigation.navigate('Points', {
      uf: selectedUf,
      city: selectedCity
    })
  }

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Ubuntu_700Bold
  });

  if (!fontsLoaded) {
    return <AppLoading />
  }

  return (
    <ImageBackground 
      source={require('../../assets/home-background.png')}
      style={styles.container}
      imageStyle={{
        width: 274, height:368
      }}
      >
      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')} />
        <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
        <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente</Text>
        <RNPickerSelect 
          style={pickerSelectStyles}
          placeholder={{label: 'UF', value: ''}}        
          onValueChange={(value) => setSelectedUf(value)}
          useNativeAndroidPickerStyle={false}          
          items={ufs}
        />
        <RNPickerSelect 
          style={pickerSelectStyles}
          placeholder={{label: 'Cidade', value: ''}}
          onValueChange={(value) => setSelectedCity(value)}
          useNativeAndroidPickerStyle={false}          
          items={cities}
        />
      </View>      
      
      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleNavigateToPoints}>
          <View style={styles.buttonIcon}>
            <Text>
              <Icon 
                name="arrow-right"
                color="#fff"
                size={24}/>    
            </Text>
          </View>
          <Text style={styles.buttonText}>
            Entrar
          </Text>
        </RectButton>
      </View>

    </ImageBackground>
  )
}
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginTop: 16,
    paddingHorizontal: 24,
    fontSize: 16,
    borderWidth: 0.5,
    borderColor: 'gray',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    backgroundColor: '#f0f0f5'
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});

export default Home;