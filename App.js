import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, StyleSheet, Text, TextInput, View, FlatList } from 'react-native';
import { useState } from 'react' 

let nextId = 0

export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Page1'>
        <Stack.Screen
          name='Page1'
          component={Page1}
        />
        <Stack.Screen
          name='Page2'
          component={Page2}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const Page1 = ({navigation, route}) => {
  const savedData = route.params?.savedData
  const [list, editList] = useState([])

  if(savedData != null && savedData.status == true){
    savedData.status = false
    const filteredArr = [...list.filter((note) => note.id != savedData.id )]
    filteredArr.splice(savedData.id, 0, {id:savedData.id, title: savedData.title, text: savedData.text})
    editList([...filteredArr])
  }
    
  return (  
    <View style={styles.container}>
      <Button 
      color={"black"}
      style={styles.button}
       title='+'
        onPress={() =>{ 
          editList([
            ...list,
            {id:nextId++, title: `Unnamed note ${nextId}`}
          ])
         }}>
        </Button>
         

      <FlatList
      data={list}
      renderItem={(note) => <Text style={styles.noteListItem} title='test' onPress={()=>
         navigation.navigate("Page2", {noteData: note.item})}>{note.item.title}</Text>}
      />
      <StatusBar style="auto" />
    </View>
  );
}
  

const Page2 = ({navigation, route}) => {
  const noteData = route.params?.noteData 
  const savedData = {id:noteData.id, title:noteData.title, status:true}
  
  return (
    <View style={styles.container}>

      <TextInput 
        defaultValue={noteData.title}
        style={styles.textInputTitle}
        onChangeText={(title) => savedData.title = title}
        placeholder='Note title'/>

      <TextInput 
        multiline
        defaultValue={noteData.text}
        style={styles.textInput}
        onChangeText={(txt) => savedData.text = txt}
        placeholder='Write notes here'/>

      <Button
        color={"black"}
        title='Save'
        onPress={()=> navigation.navigate(
        "Page1", {savedData}
        )}
      />
      </View>
)
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffd74',
  },
  noteListItem:{
    width: '100%',
    padding: 2,
    borderTopColor: "black",
    borderTopWidth: 1,
    paddingLeft: 10,
    },
  textInput:{
     backgroundColor: '#fffd74',
     maxWidth:"100%",
     height: "100%",
     padding: 5,
     },  
  textInputTitle:{
     backgroundColor: '#fffd74',
     padding: 5,
     borderBottomColor: "black",
     borderBottomWidth: 1
     }
   });
