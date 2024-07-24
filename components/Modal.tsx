import React, { useState } from 'react';
import Button from './Button';

interface ModalProps {
    title?: string
    isOpen: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClose = () => {
        setTimeout(() => {
            onClose();
        }, 100);
    };

    if (!isOpen && !isAnimating) {
        return null;
    }

    const modalStyle = 'fixed z-20 bg-white top-1/2 -translate-y-1/2 p-5 w-80 left-1/2 -translate-x-1/2 rounded-lg shadow-lg';

    return (
        <>
            <div className='fixed z-10 top-0 left-0 bottom-0 right-0 bg-black opacity-65'></div>
            <div className={modalStyle}>
                {title && <div id='modal-title' className='text-lg font-bold'>
                    <h1>{title}</h1>
                </div>}
                <div id="modal-content" className='mt-5'>
                    {children}
                </div>
                <div id="modal-footer" className='mt-5'>
                    <Button color='black' size="small" onClick={handleClose} className='px-4'>
                        닫기
                    </Button>
                </div>
            </div>
        </>
    );
};

export default Modal;