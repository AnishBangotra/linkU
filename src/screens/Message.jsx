import React, {useState, useLayoutEffect, useEffect} from 'react'
import { 
  SafeAreaView, 
  View,
  InputAccessoryView,
  FlatList,
  Animated,
  Easing,
  Platform,
  TextInput,
  TouchableOpacity,
  Text
} from 'react-native'
import Thumbnail from '../components/Thumbnail'
import ModalComponent from '../components/ModalComponent'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import useGlobal from '../core/global'

function renderComponent() {
	const unlinkText = 'Unlink';
	return(
			<View
				style={{
					borderColor: 'rgba(52, 52, 52, 0.8)',
					backgroundColor: '#fff',
					width: 80,
				}}>
				<Text
					style={{
						fontSize: 16,
						color: 'red',
						textAlign: 'center'
					}}>
				{unlinkText}
				</Text>
					
			</View>
	)
}



function MessageHeader({ friend, showModal, setModal }) {

  const onClick = () => {
	setModal(!showModal)
  }
  return(
    <View style={{
      flex: 1,
      flexDirection: 'row',
	  width: '100%',
      alignItems: 'center',
    }}>
      <Thumbnail 
        url={friend.thumbnail}
        size={30}
      />
      <Text
        style={{
          color: '#202020',
          marginLeft: 10,
          fontSize: 18,
          fontWeight: 'bold'
        }}
      >
        {friend.name}
      </Text>
	  <TouchableOpacity onPress={() => onClick()}
	  	style={{
			position: 'absolute',
			right: 10,
		}}
	  >
		{renderComponent()}
	  </TouchableOpacity>
    </View>
  )
}


function MessageBubbleMe({ text }) {
	return (
		<View
			style={{
				flexDirection: 'row',
				padding: 4,
				paddingRight: 12
			}}
		>
			<View style={{ flex: 1}} />
			<View
				style={{
					backgroundColor: '#303040',
					borderRadius: 21,
					maxWidth: '75%',
					paddingHorizontal: 16,
					paddingVertical: 12,
					justifyContent: 'center',
					marginRight: 8,
					minHeight: 42
				}}
			>
				<Text
					style={{
						color: 'white',
						fontSize: 16,
						lineHeight: 18
					}}
				>
					{text}
				</Text>
			</View>
		</View>
	)
}


function MessageTypingAnimation({ offset }) {
	const y = useRef(new Animated.Value(0)).current

	useEffect(() => {
		const total = 1000
		const bump = 200

		const animation = Animated.loop(
			Animated.sequence([
				Animated.delay(bump * offset),
				Animated.timing(y, {
					toValue: 1,
					duration: bump,
					easing: Easing.linear,
					useNativeDriver: true
				}),
				Animated.timing(y, {
					toValue: 0,
					duration: bump,
					easing: Easing.linear,
					useNativeDriver: true
				}),
				Animated.delay(total - bump * 2 - bump * offset),
			])
		)
		animation.start()
		return () => {
			animation.stop()
		}
	}, [])

	const translateY = y.interpolate({
		inputRange: [0, 1],
		outputRange: [0, -8]
	})

	return (
		<Animated.View
			style={{
				width: 8,
				height: 8,
				marginHorizontal: 1.5,
				borderRadius: 4,
				backgroundColor: '#606060',
				transform: [{ translateY }]
			}}
		/>
	)
}


function MessageBubbleFriend({ text, friend, typing=false }) {
  if (text === undefined) return
	return (
		<View
			style={{
				flexDirection: 'row',
				padding: 4,
				alignItems: 'center',
				paddingLeft: 16
			}}
		>
			<Thumbnail
				url={friend.thumbnail}
				size={30}
			/>
			<View
				style={{
					backgroundColor: '#d0d2db',
					borderRadius: 21,
					maxWidth: '75%',
					paddingHorizontal: 16,
					paddingVertical: 12,
					justifyContent: 'center',
					marginLeft: 8,
					minHeight: 42
				}}
			>
				{typing ? (
					<View style={{ flexDirection: 'row' }}>
						<MessageTypingAnimation offset={0} />
						<MessageTypingAnimation offset={1} />
						<MessageTypingAnimation offset={2} />
					</View>
				) : (
					<Text
						style={{
							color: '#202020',
							fontSize: 16,
							lineHeight: 18
						}}
					>
						{text}
					</Text>
				)}
				
			</View>
			<View style={{ flex: 1}} />
		</View>
	)
}


function MessageBubble({ index, message, friend }) {
	const [showTyping, setShowTyping] = useState(false)

	const messagesTyping = useGlobal(state => state.messagesTyping)

	useEffect(() => {
		if (index !== 0) return
		if (messagesTyping === null) {
			setShowTyping(false)
			return
		}
		setShowTyping(true)
		const check = setInterval(() => {
			const now = new Date()
			const ms = now - messagesTyping
			if (ms > 10000) {
				setShowTyping(false)
			}
		}, 1000)
		return () => clearInterval(check)
	}, [messagesTyping])


	if (index === 0) {
		if (showTyping) {
			return <MessageBubbleFriend friend={friend} typing={true} />
		}
		return
	}

	return message.is_me ? (
		<MessageBubbleMe text={message.text} />
	) : (
		<MessageBubbleFriend text={message.text} friend={friend} />
	)
}


function MessageInput({ message, setMessage, onSend}) {
  return (
    <View
			style={{
				paddingHorizontal: 10,
				paddingBottom: 10,
				backgroundColor: 'white',
				flexDirection: 'row',
				alignItems: 'center'
			}}
		>
			<TextInput
				placeholder="Message..."
				placeholderTextColor='#909090'
				value={message}
				onChangeText={setMessage}
				style={{
					flex: 1,
					paddingHorizontal: 18,
					borderWidth: 1,
					borderRadius: 25,
					borderColor: '#d0d0d0',
					backgroundColor: 'white',
					height: 50
				}}
			/>
			<TouchableOpacity onPress={onSend}>
				<FontAwesomeIcon
					icon='paper-plane'
					size={22}
					color={'#303040'}
					style={{
						marginHorizontal: 12
					}}
				/>
			</TouchableOpacity>
		</View>

  )
}


const MessageScreen = ({navigation, route}) => {
  const [message, setMessage] = useState('')
  const [showModal, setModal] = useState(false);
  const friendList = useGlobal(state => state.friendList)
  const messagesList = useGlobal(state => state.messagesList)
  const messageList = useGlobal(state => state.messageList)
  const messageSend = useGlobal(state => state.messageSend)

  const connectionId = route.params.id
  const friend = route.params.friend

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <MessageHeader friend={friend} showModal={showModal} setModal={setModal} />
      )
    })
  }, [])

  useEffect(() => {
    messageList(connectionId)
  }, [])

  	function onSend() {
		const cleaned = message.replace(/\s+/g, ' ').trim()
		if (cleaned.length === 0) return
		messageSend(connectionId, cleaned)
		setMessage('')
	}

	function onType(value) {
		setMessage(value)
		// messageType(friend.username)
	}

	function ulinkConnection() {
		console.log('listttttttttttttt', friendList)
		alert('remove')
	}

  return (
    <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1
          }}
        >
		<ModalComponent showModal={showModal} child={ulinkConnection} setModal={setModal} /> 
        <FlatList
            automaticallyAdjustKeyboardInsets={true}
            contentContainerStyle={{
              paddingTop: 30
            }}
            data={[{id: -1}, ...messagesList]}
            inverted={true}
            keyExtractor={item => item.id}
            // onEndReached={() => {
            //   if (messagesNext) {
            //     messageList(connectionId, messagesNext)
            //   }
            // }}
            renderItem={({ item, index}) => (
              <MessageBubble
                index={index}
                message={item}
                friend={friend}
              />
            )}
        />
        </View>
        {Platform.OS === 'ios' ? (
				<InputAccessoryView>
					<MessageInput 
						message={message}
						setMessage={onType}
						onSend={onSend}
					/>
				</InputAccessoryView>
			) : (
				<MessageInput 
					message={message}
					setMessage={onType}
					onSend={onSend}
				/>
			)}

    </SafeAreaView>
  )
}

export default MessageScreen