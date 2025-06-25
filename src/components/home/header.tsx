const Header = () => {
  return (
    <div className="pb-10 text-center flex flex-col items-center justify-start pt-12 transition-colors duration-500 text-foreground">
      <h1 className="text-3xl font-bold">
        Your{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-foreground">
          Feedback
        </span>{" "}
        Matters
      </h1>

      <p className="text-lg text-muted-foreground mt-2  transition-colors duration-300">
        Share your thoughts and help us improve our AI workshops and events
      </p>
    </div>
  );
};

export default Header;
