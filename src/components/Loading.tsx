function Loading() {
  return (
    <div className="w-full h-screen flex justify-center items-center py-8">
      <div
        data-testid="spinner"
        className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"
      ></div>
    </div>
  );
}

export default Loading;
