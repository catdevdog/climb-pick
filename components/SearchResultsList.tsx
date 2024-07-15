import React from "react";
import { TypePlace } from "@/types/place";

interface SearchResultsListProps {
  results: TypePlace[];
}

/**
 * 검색 결과 목록을 표시하는 컴포넌트
 * @param {SearchResultsListProps} props - 컴포넌트 props
 * @returns {React.ReactElement} 검색 결과 목록 컴포넌트
 */
const SearchResultsList: React.FC<SearchResultsListProps> = React.memo(
  ({ results }) => {
    return (
      <div className="bg-white bg-opacity-80 fixed bottom-16 left-5 p-2 rounded-lg z-10 overflow-y-auto max-h-[60vh] w-80">
        <h2 className="text-lg font-bold mb-2">검색 결과</h2>
        {results.length === 0 ? (
          <p>검색 결과가 없습니다.</p>
        ) : (
          <ul>
            {results.map((result, idx) => (
              <li
                key={`${result.name}_${idx}`}
                className="border-b border-gray-200 py-2 last:border-b-0"
              >
                <h3 className="text-sm font-bold">{result.name}</h3>
                <p className="text-xs">{result.address}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs mr-2">
                    평점: {result.rating.toFixed(1)}
                  </span>
                  <span className="text-xs">
                    리뷰 수: {result.user_ratings_total}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

SearchResultsList.displayName = "SearchResultsList";

export default SearchResultsList;
