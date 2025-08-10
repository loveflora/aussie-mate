"use client";
import { useContext, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { LanguageContext } from "../client-layout";

// 테스트용 게시글 데이터
const posts = [
  {
    id: 1,
    title: "시드니에서 한국 음식점 추천해주세요",
    author: "aussie_lover",
    date: "2025-08-08",
    views: 245,
    likes: 18,
    comments: 32,
    content: "시드니에 처음 와서 정착 중인데요, 한국 음식이 그리워집니다. 시드니 시내나 근교에서 맛있고 가성비 좋은 한국 음식점 추천해주세요!",
    commentsList: [
      { id: 1, author: "sydney_kim", content: "스트라스필드에 있는 '맛찬들'이 가성비 최고입니다. 특히 된장찌개가 추천!", date: "2025-08-08" },
      { id: 2, author: "foodie123", content: "시드니 시내 타운홀 근처의 '맛집' 추천드려요. 양도 많고 가격도 합리적이에요.", date: "2025-08-08" },
      { id: 3, author: "oz_traveler", content: "차이나타운 근처 코리아타운에 가시면 다양한 한식당이 있어요. 개인적으로는 '서울식당'이 좋았습니다.", date: "2025-08-08" }
    ]
  },
  {
    id: 2,
    title: "워킹홀리데이 비자 연장 질문",
    author: "visa_seeker",
    date: "2025-08-07",
    views: 312,
    likes: 24,
    comments: 16,
    content: "첫 해 워홀 비자가 곧 만료되는데, 팜워크를 통한 연장을 고려 중입니다. 현재 NSW에 있는데, 어느 지역의 팜이 조건도 괜찮고 환경도 괜찮은지 경험 있으신 분들 조언 부탁드립니다.",
    commentsList: [
      { id: 1, author: "farm_expert", content: "퀸즐랜드 번다버그 지역 추천합니다. 날씨도 따뜻하고 한국인들이 많아서 적응하기 쉬워요.", date: "2025-08-07" },
      { id: 2, author: "second_year", content: "저는 태즈매니아에서 애플 피킹으로 88일 채웠어요. 날씨가 선선해서 일하기 좋았습니다.", date: "2025-08-07" }
    ]
  },
  {
    id: 3,
    title: "시드니 한인 모임 있나요?",
    author: "new_in_sydney",
    date: "2025-08-06",
    views: 189,
    likes: 15,
    comments: 8,
    content: "시드니에 온지 2주 정도 됐는데, 또래 한인 친구들 만날 수 있는 모임이나 커뮤니티 있을까요? 20대 중반입니다.",
    commentsList: [
      { id: 1, author: "sydney_social", content: "페이스북에 '시드니 한인 청년회'라는 그룹이 있어요. 정기적으로 모임도 열고 활발하게 활동 중입니다.", date: "2025-08-06" }
    ]
  },
  {
    id: 4,
    title: "호주에서 가장 좋았던 여행지는?",
    author: "travel_lover",
    date: "2025-08-05",
    views: 276,
    likes: 31,
    comments: 22,
    content: "호주 생활하면서 다녀오신 여행지 중에 가장 좋았던 곳 공유해주세요! 다음 휴가때 참고하려고 합니다 :)",
    commentsList: [
      { id: 1, author: "beach_fan", content: "케언즈의 그레이트 배리어 리프는 꼭 가보세요. 평생 잊지 못할 경험이 될 거에요!", date: "2025-08-05" },
      { id: 2, author: "outback_explorer", content: "울룰루(에어즈락)이요! 사막 한가운데 있는 거대한 바위산의 신비로움은 정말 특별합니다.", date: "2025-08-05" }
    ]
  }
];

export default function CommunityPage() {
  // 글로벌 언어 컨텍스트 사용
  const { language } = useContext(LanguageContext);
  
  const [selectedPost, setSelectedPost] = useState(null);
  const [isWriting, setIsWriting] = useState(false);
  const [newPostContent, setNewPostContent] = useState({ title: '', content: '' });
  const [newComment, setNewComment] = useState('');

  // 번역 텍스트 객체
  const translations = {
    ko: {
      pageTitle: "커뮤니티",
      writePost: "글쓰기",
      search: "검색",
      all: "전체글",
      popular: "인기글",
      notice: "공지사항",
      postTitle: "제목",
      author: "작성자",
      date: "작성일",
      views: "조회수",
      likes: "좋아요",
      comments: "댓글",
      back: "목록으로",
      writeComment: "댓글 작성...",
      submit: "등록",
      newPostTitle: "제목을 입력하세요",
      newPostContent: "내용을 입력하세요",
      cancel: "취소",
    },
    en: {
      pageTitle: "Community",
      writePost: "Write",
      search: "Search",
      all: "All Posts",
      popular: "Popular",
      notice: "Notices",
      postTitle: "Title",
      author: "Author",
      date: "Date",
      views: "Views",
      likes: "Likes",
      comments: "Comments",
      back: "Back to List",
      writeComment: "Write a comment...",
      submit: "Submit",
      newPostTitle: "Enter title",
      newPostContent: "Enter content",
      cancel: "Cancel",
    }
  };

  // 현재 언어에 맞는 번역 선택
  const t = translations[language];

  // 게시글 선택
  const selectPost = (post) => {
    setSelectedPost(post);
    setIsWriting(false);
  };

  // 목록으로 돌아가기
  const goToList = () => {
    setSelectedPost(null);
    setIsWriting(false);
  };

  // 새 글 작성 시작
  const startWritingPost = () => {
    setIsWriting(true);
    setSelectedPost(null);
  };

  // 새 글 작성 취소
  const cancelWriting = () => {
    setIsWriting(false);
    setNewPostContent({ title: '', content: '' });
  };

  // 새 글 제출
  const submitNewPost = () => {
    // 여기에 게시글 저장 로직 추가
    setIsWriting(false);
    setNewPostContent({ title: '', content: '' });
  };

  // 댓글 작성
  const submitComment = () => {
    if (newComment.trim()) {
      // 여기에 댓글 저장 로직 추가
      setNewComment('');
    }
  };

  // 게시글 목록 보기
  const renderPostList = () => (
    <div className={styles.postsListContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.communityTitle}>{t.pageTitle}</h1>
        </div>
        <button className={styles.newPostButton} onClick={startWritingPost}>
          {t.writePost}
        </button>
      </div>
      
      <div className={styles.postsList}>
        {posts.map(post => (
          <div key={post.id} className={styles.postItem} onClick={() => selectPost(post)}>
            <h3 className={styles.postTitle}>{post?.title}</h3>
            <p className={styles.postPreview}>{post?.content.substring(0, 100)}...</p>
            <div className={styles.postMeta}>
              <span>{post?.author}</span>
              <span>•</span>
              <span>{post?.date}</span>
              <span>•</span>
              <span>{t?.comments}: {post?.comments}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 게시글 상세 보기
  const renderPostDetail = () => (
    <div className={styles.postDetail}>
      <button className={styles.backButton} onClick={goToList}>
        ← {t.back}
      </button>
      
      <h1 className={styles.detailTitle}>{selectedPost?.title}</h1>
      <div className={styles.detailMeta}>
        <span>{selectedPost?.author}</span>
        <span>•</span>
        <span>{selectedPost?.date}</span>
        <span>•</span>
        <span>{t.views}: {selectedPost?.views}</span>
        <span>•</span>
        <span>{t.likes}: {selectedPost?.likes}</span>
      </div>
      
      <div className={styles.detailContent}>
        {selectedPost?.content}
      </div>
      
      <div className={styles.commentsSection}>
        <h3>{t.comments} ({selectedPost?.commentsList.length})</h3>
        
        {selectedPost?.commentsList.map(comment => (
          <div key={comment.id} className={styles.commentItem}>
            <div className={styles.commentMeta}>
              <span className={styles.commentAuthor}>{comment.author}</span>
              <span className={styles.commentDate}>{comment.date}</span>
            </div>
            <p className={styles.commentContent}>{comment.content}</p>
          </div>
        ))}
        
        <div className={styles.addCommentSection}>
          <textarea 
            className={styles.commentInput}
            placeholder={t?.writeComment}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button className={styles.commentButton} onClick={submitComment}>
            {t?.submit}
          </button>
        </div>
      </div>
    </div>
  );

  // 새 게시글 작성
  const renderNewPostForm = () => (
    <div className={styles.newPostForm}>
      <div className={styles.formHeader}>
        <h2>{t.writePost}</h2>
        <button className={styles.cancelButton} onClick={cancelWriting}>
          {t.cancel}
        </button>
      </div>
      
      <input
        type="text"
        className={styles.titleInput}
        placeholder={t.newPostTitle}
        value={newPostContent?.title}
        onChange={(e) => setNewPostContent({...newPostContent, title: e.target.value})}
      />
      
      <textarea
        className={styles.contentInput}
        placeholder={t.newPostContent}
        value={newPostContent.content}
        onChange={(e) => setNewPostContent({...newPostContent, content: e.target.value})}
      />
      
      <div style={{ textAlign: 'right', marginTop: '16px' }}>
        <button className={styles.submitButton} onClick={submitNewPost}>
          {t.submit}
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.pageWrapper}>
      {selectedPost ? renderPostDetail() : isWriting ? renderNewPostForm() : renderPostList()}
    </div>
  );
}
