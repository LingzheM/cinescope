-- CreateTable
CREATE TABLE "Movie" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "genres" TEXT[],
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "userId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL
);

-- CreateTable
CREATE TABLE "CFSimilarity" (
    "movieId" INTEGER NOT NULL,
    "similarMovieId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "movieId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Rating_movieId_idx" ON "Rating"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userId_movieId_key" ON "Rating"("userId", "movieId");

-- CreateIndex
CREATE INDEX "CFSimilarity_movieId_score_idx" ON "CFSimilarity"("movieId", "score" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "CFSimilarity_movieId_similarMovieId_key" ON "CFSimilarity"("movieId", "similarMovieId");

-- CreateIndex
CREATE INDEX "UserSession_timestamp_idx" ON "UserSession"("timestamp");

-- CreateIndex
CREATE INDEX "UserSession_movieId_idx" ON "UserSession"("movieId");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CFSimilarity" ADD CONSTRAINT "CFSimilarity_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
