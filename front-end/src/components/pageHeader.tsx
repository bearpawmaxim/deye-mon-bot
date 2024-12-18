import { FC } from "react";
import { Button, Grid, GridColumn, GridRow, Header, Segment } from "semantic-ui-react";
import { PageHeaderButton } from "../providers";
import { useNavigate } from "react-router-dom";

export type PageHeaderProps = {
  caption?: string;
  buttons: Array<PageHeaderButton>
};

export const PageHeader: FC<PageHeaderProps> = ({ caption, buttons }: PageHeaderProps) => {
  const navigate = useNavigate();

  return <Segment basic>
  <Grid columns={2}>
    <GridRow>
      <GridColumn width={'10'}>
        <Header as='h3' color="teal" textAlign='left'>
          <Button icon={'arrow left'} color="teal" onClick={() => navigate(-1)}/>
          {caption}
        </Header>
      </GridColumn>
      <GridColumn width={'6'} textAlign="right">
        { buttons.map((button, i) => 
            <Button key={`header_btn_${i}`} color={button.color} 
              disabled={button.disabled} icon={button.icon} onClick={(_: unknown) => button.onClick()}>
              {button.text}
            </Button>
        )}
      </GridColumn>
    </GridRow>
  </Grid>
  </Segment>;
}