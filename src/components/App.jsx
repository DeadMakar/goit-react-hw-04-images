import { fetchImages } from 'api/fetchImages';
import { ImageGallery } from './Gallery/ImageGallery/ImageGallery';
import { Searchbar } from './SearchBar/SearchBar';
import { LoadMoreBtn } from './LoadMoreBtn/LoadMoreBtn';
import { Loader } from './Loader/Loader';
import { MyModal } from './Modal/Modal';
import toast, { Toaster } from 'react-hot-toast';
import { GlobalStyle } from './GlobalStyle';
import { animateScroll as scroll } from 'react-scroll';
import { generateRandomIndex } from './utils/generateRandomIndex';
import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';

export const App = () => {
  const [dataImages, setDataImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [per_page] = useState(12);
  const [largeImageURL, setLargeImageURL] = useState('');
  const [tagImageAlt, setTagImageAlt] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [availablePages, setAvailablePages] = useState(0);
  const [randomIndex, setRandomIndex] = useState(generateRandomIndex());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(false);

        if (searchQuery.trim() === '') {
          return;
        }

        const initialImages = await fetchImages(searchQuery, page);
        const { hits, totalHits } = initialImages;

        if (hits.length > 0) {
          setDataImages(prevDataImages => [
            ...prevDataImages,
            ...hits.map(image => ({ ...image, id: nanoid() })),
          ]);
          setAvailablePages(Math.ceil(totalHits / per_page));
          toast.success('Successfully found!');
        } else {
          toast.error(
            'Nothing found. Check the correctness of the search word.'
          );
        }
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleScroll = () => {
      scroll.scrollToBottom();
    };

    const cleanup = () => {
      setIsLoading(false);
    };

    if (searchQuery.trim() !== '') {
      fetchData();
    }

    const handleScrollWithPassive = () => {
      handleScroll();
    };

    window.addEventListener('scroll', handleScrollWithPassive, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScrollWithPassive);
      cleanup();
    };
  }, [searchQuery, page, per_page, randomIndex]);

  const handleFormSubmit = newQuery => {
    setSearchQuery(newQuery);
    setPage(1);
    setDataImages([]);
    setRandomIndex(generateRandomIndex());
  };

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
    scroll.scrollToBottom();
  };

  const handleOpenModal = image => {
    const { largeImageURL, tags } = image;
    setShowModal(true);
    setLargeImageURL(largeImageURL);
    setTagImageAlt(tags);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setLargeImageURL('');
    setTagImageAlt('');
  };

  return (
    <div>
      <Searchbar onFormSubmit={handleFormSubmit} />

      {isLoading && <Loader />}

      {error && <h1>{error.message}</h1>}

      {dataImages.length > 0 && (
        <ImageGallery dataImages={dataImages} onOpenModal={handleOpenModal} />
      )}

      {page !== availablePages && dataImages.length >= 11 && !error && (
        <LoadMoreBtn onLoadMore={handleLoadMore} />
      )}

      {showModal && (
        <MyModal onCloseModal={handleCloseModal}>
          <img src={largeImageURL} alt={tagImageAlt} />
        </MyModal>
      )}

      {error && (
        <b>Oops! Something went wrong! Please try reloading this page! 🥹</b>
      )}

      <GlobalStyle />
      <Toaster />
    </div>
  );
};
