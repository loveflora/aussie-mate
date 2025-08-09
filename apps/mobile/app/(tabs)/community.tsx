import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';

// Mock data for community posts
const MOCK_POSTS = {
  en: [
    {
      id: '1',
      title: 'Recommend Korean grocery stores in Sydney',
      author: 'SydneyNewbie',
      date: '2025-08-09',
      likes: 24,
      comments: 15,
      content: 'I recently moved to Sydney and would love recommendations for Korean grocery stores. I live near Strathfield.',
    },
    {
      id: '2',
      title: 'Korean food delivery in Melbourne',
      author: 'MelbourneLover',
      date: '2025-08-08',
      likes: 18,
      comments: 7,
      content: 'Can anyone recommend Korean restaurants that deliver in Melbourne CBD? I miss home food so much!',
    },
    {
      id: '3',
      title: 'How difficult is getting an Australian driving license?',
      author: 'FutureDriver',
      date: '2025-08-07',
      likes: 32,
      comments: 21,
      content: 'I\'m curious about the process and difficulty of getting a driving license in Australia. Can I easily convert my Korean license?',
    },
    {
      id: '4',
      title: 'Any Korean communities in Brisbane?',
      author: 'BrisbaneLife',
      date: '2025-08-06',
      likes: 12,
      comments: 8,
      content: 'Are there any regular Korean meetups or communities in Brisbane? Would love to connect!',
    },
    {
      id: '5',
      title: 'Working Holiday Visa preparation tips',
      author: 'WHVPrep',
      date: '2025-08-05',
      likes: 45,
      comments: 17,
      content: 'I\'m planning for a working holiday next year. What tips should I know before preparing?',
    },
  ],
  ko: [
    {
      id: '1',
      title: '호주 시드니 한인마트 추천해주세요',
      author: '시드니뉴비',
      date: '2025-08-09',
      likes: 24,
      comments: 15,
      content: '시드니에 이사온지 얼마 안됐는데 한인마트 추천 부탁드립니다. 스트라스필드 근처 살고 있어요.',
    },
    {
      id: '2',
      title: '멜버른에서 한국 음식 배달 가능한 곳',
      author: '멜번러버',
      date: '2025-08-08',
      likes: 18,
      comments: 7,
      content: '멜버른 시티에서 한국 음식 배달 가능한 맛집 알려주세요! 요즘 고향 음식이 너무 그립네요.',
    },
    {
      id: '3',
      title: '호주 운전면허 따기 어려운가요?',
      author: '예비드라이버',
      date: '2025-08-07',
      likes: 32,
      comments: 21,
      content: '호주에서 운전면허 따는 과정과 난이도가 궁금합니다. 한국 면허 있으면 쉽게 바꿀 수 있나요?',
    },
    {
      id: '4',
      title: '브리즈번 한인 모임 있을까요?',
      author: '브리즈번살이',
      date: '2025-08-06',
      likes: 12,
      comments: 8,
      content: '브리즈번에서 한인들 정기적으로 만나는 모임이나 커뮤니티 있으면 알려주세요!',
    },
    {
      id: '5',
      title: '호주 워홀 비자 준비 팁',
      author: '워홀준비중',
      date: '2025-08-05',
      likes: 45,
      comments: 17,
      content: '내년에 워홀 갈 예정인데 준비하면서 알아두면 좋을 팁들 공유해주세요.',
    },
  ]
};

// Mock data for comments
const MOCK_COMMENTS = {
  en: {
    '1': [
      { id: '1-1', author: 'AussieMum', content: 'There\'s a Korean Mart in downtown Strathfield. They have a great variety and everything is fresh!', date: '2025-08-09' },
      { id: '1-2', author: 'FromMelbourne', content: 'I recommend Woori Mart in Campsie. They have lots of Korean products.', date: '2025-08-09' },
      { id: '1-3', author: 'SydneyResident', content: 'There\'s also a good Korean grocery in Eastwood. Convenient parking and reasonable prices.', date: '2025-08-09' },
    ],
    '2': [
      { id: '2-1', author: 'MelbourneKim', content: 'Most Korean restaurants near Chinatown deliver through Uber Eats!', date: '2025-08-08' },
      { id: '2-2', author: 'AussieFoodie', content: 'DoorDash also delivers from many Korean restaurants. Especially within the CBD you have many options.', date: '2025-08-08' },
    ],
    '3': [
      { id: '3-1', author: 'SydneyDriver', content: 'In NSW, you can exchange a Korean license without testing. You just need a certified translation.', date: '2025-08-07' },
      { id: '3-2', author: 'QLDResident', content: 'Queensland requires a written test. And you\'ll need to take a practical test too.', date: '2025-08-07' },
      { id: '3-3', author: 'AdelaidePerson', content: 'I got my license in SA, and even with a Korean license, I had to take the practical test. It wasn\'t difficult though.', date: '2025-08-07' },
    ],
    '4': [
      { id: '4-1', author: 'Brisbane3Years', content: 'There\'s a Brisbane Korean Community group on Facebook. Lots of information is shared there!', date: '2025-08-06' },
    ],
    '5': [
      { id: '5-1', author: 'WHVSenior', content: 'You\'ll need a medical check for the visa application. I recommend booking your appointment early.', date: '2025-08-05' },
      { id: '5-2', author: 'SydneyWHVer', content: 'It\'s good to set up an Australian bank account in advance. Some banks allow online applications.', date: '2025-08-05' },
    ],
  },
  ko: {
    '1': [
      { id: '1-1', author: '호주맘', content: '스트라스필드 다운타운에 Korean Mart가 있어요. 거기 품목이 다양하고 신선해요!', date: '2025-08-09' },
      { id: '1-2', author: '멜번에서왔어요', content: '저는 캄시에 있는 우리마트를 추천합니다. 한국 식품이 정말 많아요.', date: '2025-08-09' },
      { id: '1-3', author: '시드니거주자', content: '이스트우드에도 괜찮은 한인마트가 있어요. 주차도 편리하고 가격도 합리적인 편이에요.', date: '2025-08-09' },
    ],
    '2': [
      { id: '2-1', author: '멜번사는김씨', content: '우버이츠로 멜번 차이나타운 근처 한식당들은 대부분 배달 가능해요!', date: '2025-08-08' },
      { id: '2-2', author: '호주푸디', content: '도어대시(DoorDash)도 한국 음식점 배달 많이 해요. 특히 CBD 안에서는 선택지가 많답니다.', date: '2025-08-08' },
    ],
    '3': [
      { id: '3-1', author: '시드니운전자', content: '한국 면허 있으면 NSW에서는 시험 없이 교환 가능해요. 단, 번역공증이 필요합니다.', date: '2025-08-07' },
      { id: '3-2', author: '퀸즐랜드거주중', content: '퀸즐랜드는 필기시험이 있어요. 그리고 실기시험도 봐야 해요.', date: '2025-08-07' },
      { id: '3-3', author: '애들레이드사는사람', content: '저는 SA에서 면허 땄는데 한국 면허 있어도 실기시험은 봐야 했어요. 그래도 어렵지 않았습니다.', date: '2025-08-07' },
    ],
    '4': [
      { id: '4-1', author: '브리즈번3년차', content: '페이스북에 브리즈번 한인 커뮤니티 그룹이 있어요. 거기서 정보 많이 공유합니다!', date: '2025-08-06' },
    ],
    '5': [
      { id: '5-1', author: '워홀선배', content: '비자 신청할 때 건강검진 결과가 필요해요. 미리 병원 예약하는 걸 추천합니다.', date: '2025-08-05' },
      { id: '5-2', author: '시드니워홀러', content: '호주 은행 계좌는 미리 개설해두면 좋아요. 온라인으로도 가능한 은행들이 있어요.', date: '2025-08-05' },
    ],
  }
};

// UI text translations
const translations = {
  en: {
    community: "Community",
    createPost: "Create Post",
    back: "← Back",
    cancel: "← Cancel",
    title: "Title",
    content: "Content",
    enterTitle: "Enter title",
    enterContent: "Enter content",
    submit: "Submit",
    likes: "Likes",
    comments: "Comments",
    noComments: "No comments yet. Be the first to comment!",
    enterComment: "Enter your comment",
    postComment: "Post",
    inputError: "Input Error",
    fillAllFields: "Please fill in both title and content.",
    commentSuccess: "Comment Posted",
    commentSuccessMsg: "Your comment has been successfully posted.",
    myAccount: "My Account",
  },
  ko: {
    community: "커뮤니티",
    createPost: "새 글 작성",
    back: "← 목록으로",
    cancel: "← 취소",
    title: "제목",
    content: "내용",
    enterTitle: "제목을 입력하세요",
    enterContent: "내용을 입력하세요",
    submit: "등록하기",
    likes: "좋아요",
    comments: "댓글",
    noComments: "아직 댓글이 없습니다. 첫 댓글을 남겨보세요!",
    enterComment: "댓글을 입력하세요",
    postComment: "등록",
    inputError: "입력 오류",
    fillAllFields: "제목과 내용을 모두 입력해주세요.",
    commentSuccess: "댓글 등록",
    commentSuccessMsg: "댓글이 성공적으로 등록되었습니다.",
    myAccount: "내 계정",
  }
};

export default function CommunityScreen() {
  const [language, setLanguage] = useState('ko'); // 'ko' for Korean, 'en' for English
  const [selectedPost, setSelectedPost] = useState(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
  });
  const [posts, setPosts] = useState(MOCK_POSTS[language]);
  const [commentText, setCommentText] = useState('');
  
  // Update posts when language changes
  useState(() => {
    setPosts(MOCK_POSTS[language]);
  }, [language]);
  
  const t = translations[language];
  
  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };
  
  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      Alert.alert(t.inputError, t.fillAllFields);
      return;
    }
    
    const newPostItem = {
      id: String(posts.length + 1),
      title: newPost.title,
      content: newPost.content,
      author: t.myAccount,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      comments: 0,
    };
    
    setPosts([newPostItem, ...posts]);
    setNewPost({ title: '', content: '' });
    setIsCreatingPost(false);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    
    Alert.alert(t.commentSuccess, t.commentSuccessMsg);
    setCommentText('');
  };

  const renderPostItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.postItem} 
      onPress={() => setSelectedPost(item)}
    >
      <Text style={styles.postTitle}>{item.title}</Text>
      <View style={styles.postMeta}>
        <Text style={styles.author}>{item.author}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <View style={styles.postStats}>
        <Text style={styles.statsText}>{t.likes} {item.likes}</Text>
        <Text style={styles.statsText}>{t.comments} {item.comments}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isCreatingPost) {
    return (
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={100}
      >
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.languageToggle}>
            <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
              <Text style={styles.languageButtonText}>{language === 'ko' ? 'English' : '한국어'}</Text>
            </TouchableOpacity>
          </View>
        
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setIsCreatingPost(false)}
          >
            <Text style={styles.backButtonText}>{t.cancel}</Text>
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t.createPost}</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t.title}</Text>
            <TextInput
              style={styles.titleInput}
              value={newPost.title}
              onChangeText={(text) => setNewPost(prev => ({ ...prev, title: text }))}
              placeholder={t.enterTitle}
              maxLength={50}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t.content}</Text>
            <TextInput
              style={styles.contentInput}
              value={newPost.content}
              onChangeText={(text) => setNewPost(prev => ({ ...prev, content: text }))}
              placeholder={t.enterContent}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleCreatePost}
          >
            <Text style={styles.submitButtonText}>{t.submit}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (selectedPost) {
    const postComments = MOCK_COMMENTS[language][selectedPost.id] || [];
    
    return (
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.languageToggle}>
            <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
              <Text style={styles.languageButtonText}>{language === 'ko' ? 'English' : '한국어'}</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedPost(null)}
          >
            <Text style={styles.backButtonText}>{t.back}</Text>
          </TouchableOpacity>
          
          <View style={styles.postDetail}>
            <Text style={styles.detailTitle}>{selectedPost.title}</Text>
            <View style={styles.detailMeta}>
              <Text style={styles.author}>{selectedPost.author}</Text>
              <Text style={styles.date}>{selectedPost.date}</Text>
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.content}>{selectedPost.content}</Text>
            </View>
            
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>{t.likes} {selectedPost.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>{t.comments} {postComments.length}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>{t.comments} {postComments.length}</Text>
              
              {postComments.length === 0 ? (
                <Text style={styles.noComments}>{t.noComments}</Text>
              ) : (
                postComments.map(comment => (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{comment.author}</Text>
                      <Text style={styles.commentDate}>{comment.date}</Text>
                    </View>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                  </View>
                ))
              )}
              
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder={t.enterComment}
                  multiline
                />
                <TouchableOpacity 
                  style={[
                    styles.commentButton,
                    !commentText.trim() && styles.disabledButton
                  ]}
                  onPress={handleAddComment}
                  disabled={!commentText.trim()}
                >
                  <Text style={styles.commentButtonText}>{t.postComment}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.languageToggle}>
        <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
          <Text style={styles.languageButtonText}>{language === 'ko' ? 'English' : '한국어'}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t.community}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.newPostButton}
        onPress={() => setIsCreatingPost(true)}
      >
        <Text style={styles.newPostButtonText}>{t.createPost}</Text>
      </TouchableOpacity>
      
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={item => item.id}
        style={styles.postList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  titleContainer: {
    marginTop: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  postList: {
    flex: 1,
  },
  postItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  postMeta: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  date: {
    fontSize: 14,
    color: '#999',
  },
  postStats: {
    flexDirection: 'row',
  },
  statsText: {
    fontSize: 12,
    color: '#888',
    marginRight: 12,
  },
  newPostButton: {
    backgroundColor: '#2e78b7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  newPostButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  backButton: {
    marginTop: 60,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2e78b7',
  },
  postDetail: {
    paddingVertical: 16,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailMeta: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contentContainer: {
    marginBottom: 24,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionButton: {
    marginRight: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
  },
  commentsSection: {
    marginBottom: 24,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  noComments: {
    color: '#999',
    fontStyle: 'italic',
  },
  commentItem: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentAuthor: {
    fontWeight: '600',
    color: '#333',
  },
  commentDate: {
    color: '#999',
    fontSize: 12,
  },
  commentContent: {
    color: '#333',
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    paddingTop: 10,
    marginRight: 8,
    minHeight: 40,
    maxHeight: 100,
  },
  commentButton: {
    backgroundColor: '#2e78b7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  commentButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 200,
  },
  submitButton: {
    backgroundColor: '#2e78b7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  languageToggle: {
    position: 'absolute',
    top: 20,
    right: 16,
    zIndex: 10,
  },
  languageButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  languageButtonText: {
    color: '#333',
    fontWeight: '500',
  },
});
