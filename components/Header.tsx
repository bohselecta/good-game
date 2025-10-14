import Image from 'next/image';

export default function Header() {
  return (
    <header className="header">
      <div className="brand">
        <span className="mark" aria-label="GoodGame logo">
          <Image
            src="/logo.png"
            alt="GoodGame?"
            width={56}
            height={56}
            style={{ borderRadius: '10px' }}
          />
        </span>
        GoodGame?
      </div>
    </header>
  );
}
