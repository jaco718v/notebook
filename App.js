import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, StyleSheet, Text, TextInput, View, FlatList, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react' ;
import { doc, setDoc, collection, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { db, storage } from './components/config'
import * as ImagePicker from "expo-image-picker"
import { ref, uploadBytes, getDownloadURL, deleteObject} from "firebase/storage"

let nextId = 0
let isDataLoaded = false
let isImgDownloadFlag = false



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
  isImgDownloadFlag = false
  const [list, editList] = useState([])
  const [deleteFlag, setFlag] = useState(false);
  
  function setNextId(noteData){
    const highestId = Math.max(...noteData.map(n => Number(n.id)))
    nextId = highestId+1
  }

  async function loadNotes(){
    await getDocs(collection(db, "notes"))
    .then((n) => { 
      const loadedNotes = []
      n.forEach(doc => {
        const noteId = doc.id
        const noteData = doc.data()
        loadedNotes.push({id: noteId, ...noteData})
        editList([...loadedNotes])
      })
      console.log("Data loaded")
    }).catch((error) => {
      console.log(error)
    });
  }

  async function createNote(data){
    await setDoc(doc(db, "notes", String(data.id)), {
      title: data.title
    }).then(() => {
      console.log("Data submitted")
    }).catch((error) => {
      console.log(error)
    });
  }

  async function updateNote(data){
    if(!data.text){
      data.text = ""
    }
    await updateDoc(doc(db, "notes", String(data.id)), {
      title: data.title,
      text: data.text
    }).then(() => {
      console.log("Data submitted")
    }).catch((error) => {
      console.log(error)
    });
  }

  async function deleteNote(dataId){
    await deleteDoc(doc(db, "notes", String(dataId)))
    const filteredArr = list.filter(n => n.id != dataId)
    editList([...filteredArr])
  }

  if(!isDataLoaded){
    isDataLoaded=true
    loadNotes()
  } else {
    setNextId(list)
  }

  if(savedData != null && savedData.status == true){
    savedData.status = false
    const filteredArr = [...list.filter((note) => note.id != savedData.id )]
    const savedNote = {id:savedData.id, title: savedData.title, text: savedData.text}
    filteredArr.splice(savedData.id, 0, savedNote)
    updateNote(savedData)
    editList([...filteredArr])
  }
    
  return (  
    <View style={styles.container}>
      <View style={styles.buttons}> 
        <TouchableOpacity 
          style={deleteFlag ? styles.buttonInactive : styles.buttonActive}
          title='Delete'
          ma
          onPress={() => {setFlag(!deleteFlag)}}> 
          <Text style={styles.backgroundText}>Delete</Text>     
        </TouchableOpacity> 
      <TouchableOpacity
      color="black"
       title='+'
       style={styles.buttonActive}
        onPress={() =>{ 
          const newNote = {id:nextId++, title: `Unnamed note ${nextId}`}
          editList([
            ...list,
            newNote
          ]), createNote(newNote)
         }}>
          <Text style={styles.backgroundText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
      data={list}
      renderItem={(note) => <Text style={styles.noteListItem} title='test' onPress={()=>{
        if(deleteFlag){
          deleteNote(note.item.id)
          setFlag(false)
        } else{
        navigation.navigate("Page2", {noteData: note.item})}}}>{note.item.title}</Text>}
      />
      <StatusBar style="auto" />
    </View>
  );
}
  

const Page2 = ({navigation, route}) => {
  const noteData = route.params?.noteData 
  const savedData = {id:noteData.id, title:noteData.title, status:true}
  const [imagePath, setImagePath] = useState(null)
  if(!isImgDownloadFlag){
    isImgDownloadFlag = true
    downloadImage()
  }

  async function launchImagePicker(){
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true
    })
    if(!result.canceled){
      setImagePath(result.assets[0].uri)
    }
  }

  async function deletePrevImg(){
    const delRef = ref(storage, `imageFor${noteData.id}.jpg`)
    await deleteObject(delRef).then(() => {
    }).catch((error) => {
      console.log(error)
    })
  }

  async function uploadImage(){
    await deletePrevImg()
    const res = await fetch(imagePath)
    const blob = await res.blob()
    const storageRef = ref(storage,`imageFor${noteData.id}.jpg`)
    uploadBytes(storageRef, blob).then((snapshot) => {
      alert("image uploaded")
    })
  }

  async function downloadImage(){
    getDownloadURL(ref(storage, `imageFor${noteData.id}.jpg`))
    .then((url) => {setImagePath(url)
    }).catch((error) => {
      console.log("fejl i image dowload " + error)
    })

  }



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

      <View style={styles.imageContainer} >
        <Image style={styles.image} source={{uri:imagePath}}/>
      </View>

      <Button
        color={"grey"}
        title='Pick image'
        onPress={launchImagePicker}
      />

      <Button
        color={"green"}
        title='Upload image'
        onPress={uploadImage}
      />

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
     },
  buttons:{
    flexDirection: 'row',
  },
  buttonInactive:{
    backgroundColor: 'black',
    padding: 5,
    width: 180
  },
  buttonActive:{
    backgroundColor: 'grey',
    padding: 5,
    width: 180
  },
  backgroundText:{
    color:"white"
  },
  image:{
    width:200,
    height:200,
    marginBottom: 10
  },
  imageContainer:{
    justifyContent:"center",
    alignItems: "center",
  }
   });
