import { useEffect } from 'react';
import { BackdropStyled, ModalStyled } from './Modal.styled';

export const MyModal = ({ onCloseModal, children }) => {
  useEffect(() => {
    const handleKeyDown = event => {
      if (event.code === 'Escape') {
        onCloseModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCloseModal]);

  const handleOverlayClick = event => {
    if (event.currentTarget === event.target) {
      onCloseModal();
    }
  };

  return (
    <BackdropStyled onClick={handleOverlayClick}>
      <ModalStyled>{children}</ModalStyled>
    </BackdropStyled>
  );
};
