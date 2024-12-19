import { FC, useEffect, useState } from "react"
import { Table, TableBody, TableHeader, TableHeaderCell, TableRow } from "semantic-ui-react"
import { connect } from "react-redux";
import { RootState, useAppDispatch } from "../../stores/store";
import { cancelBotsEditing, fetchBots, saveBots } from "../../stores/thunks";
import { cancelCreatingBot, createBot, startCreatingBot, updateBot } from "../../stores/slices";
import { BotItemRow } from "./components";
import { PageHeaderButton, useHeaderContent } from "../../providers";
import { createSelector } from "@reduxjs/toolkit";
import { BotItem } from "../../stores/types";
import { TokenEditDialog } from "./components/tokenEditDialog";


type ComponentProps = {
  bots: Array<BotItem>;
  loading: boolean;
  error: string | null;
  changed: boolean;
  creating: boolean;
};

const selectBots = (state: RootState) => state.bots.bots;

const selectChanged = createSelector(
  [selectBots],
  (bots) => bots.some(b => b.changed)
);

const mapStateToProps = (state: RootState): ComponentProps => ({
  bots: state.bots.bots,
  loading: state.bots.loading,
  error: state.bots.error,
  changed: selectChanged(state),
  creating: state.bots.creating,
});

const Component: FC<ComponentProps> = ({ bots, loading, error, changed, creating }: ComponentProps) => {
  const dispatch = useAppDispatch();
  const [initiallyChanged, setInitiallyChanged] = useState(false);

  useEffect(() => {
    dispatch(fetchBots());
  }, [dispatch]);

  const create = () => {
    dispatch(startCreatingBot());
  }

  const getHeaderButtons = (dataChanged: boolean): PageHeaderButton[] => [
    { text: 'Create', color: "teal", onClick: () => create(), disabled: false, },
    { text: 'Save', color: "green", onClick: () => dispatch(saveBots()), disabled: !dataChanged, },
    { text: 'Cancel', color: "black", onClick: () => dispatch(cancelBotsEditing()), disabled: !dataChanged, },
  ];

  const { setHeaderButtons, updateButtonAttributes } = useHeaderContent();
  useEffect(() => {
    setHeaderButtons(getHeaderButtons(false));
    return () => setHeaderButtons([]);
  }, [setHeaderButtons]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  const onBotEnableChange = (id: number, enabled: boolean) => {
    dispatch(updateBot({ id, enabled }));
  };

  const onBotTokenChange = (id: number, result: boolean, token: string) => {
    if (result) {
      dispatch(updateBot({ id, token }));
    }
  };

  const onBotCreate = (result: boolean, token: string) => {
    if (result) {
      dispatch(createBot(token));
    } else {
      dispatch(cancelCreatingBot());
    }
  };

  if (changed != initiallyChanged) {
    setInitiallyChanged(!initiallyChanged);
    setTimeout(() => {
      updateButtonAttributes(1, { disabled: !changed });
      updateButtonAttributes(2, { disabled: !changed });
    }, 1);
  }

  return <>
    <Table striped celled inverted selectable compact>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Bot</TableHeaderCell>
          <TableHeaderCell>Token</TableHeaderCell>
          <TableHeaderCell>Active</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {
          bots.map((bot, index) => 
            <BotItemRow key={`bot_${index}`} item={bot} loading={loading}
              enableChanged={onBotEnableChange.bind(this, bot.id!)}
              tokenChanged={onBotTokenChange.bind(this, bot.id!)} />
          )
        }
      </TableBody>
    </Table>
    <TokenEditDialog opened={creating} setOpened={() => {}} changed={onBotCreate} create={true} token='' />
  </>
}

export const BotsPage = connect(mapStateToProps)(Component);