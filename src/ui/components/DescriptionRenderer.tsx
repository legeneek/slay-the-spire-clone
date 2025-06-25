import { KeywordLibrary } from "../../engine/keywords/KeywordLibrary";

const KeywordTooltip = ({ keywordId }: { keywordId: string }) => {
  const keyword = KeywordLibrary[keywordId];
  if (!keyword) return <span style={{ color: "red" }}>{keywordId}</span>;

  return (
    <span className="keyword-text">
      {keyword.name}
      <div className="keyword-tooltip">
        <strong>{keyword.name}</strong>
        <p>{keyword.description}</p>
      </div>
    </span>
  );
};

export default function DescriptionRenderer({ text }: { text: string }) {
  const parts = text.split(/(\{\w+:\w+\})/g);

  return (
    <div>
      {parts.map((part, index) => {
        const match = part.match(/\{keyword:(\w+)\}/);
        if (match) {
          return <KeywordTooltip key={index} keywordId={match[1]} />;
        }
        return part;
      })}
    </div>
  );
}
